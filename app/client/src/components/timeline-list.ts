import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { instantly, queryClosest, ref } from "../functions/element-utils";
import { Cache } from "../classes/cache";
import { getAssignments, getTurns } from "../functions/db-get";
import { cloneAndSum } from "../functions/assignments";
import {
    getDateRange,
    getDateString,
    offsetDate,
    formatDateRelative,
    formatDateShort,
    getBirthdaysMatch
} from "../functions/date-utils";

@customElement("timeline-list")
export class TimelineList extends LitElement {
    protected createRenderRoot = () => this;

    private readonly initialMinIndex = -20;
    private readonly initialMaxIndex = 20;
    private readonly threshold = 400;
    private readonly batchSize = 30;
    private readonly relFormatMedia = {
        collapseDayName: matchMedia(
            "((width <= 560px) or ((width <= 700px) and (width >= 550px)))"
        ),
        collapseMonth: matchMedia("(width <= 650px)"),
        collapseDayNum: matchMedia("(width <= 350px)")
    };
    private handleScrolling = true;

    @state() private dates: string[] = [];
    @state() private minIndex = this.initialMinIndex;
    @state() private maxIndex = this.initialMaxIndex;
    @state() private members: UiMember[] = [];
    @state() private currentMember?: UiMember | null;

    @query(":scope > ol") private container!: HTMLElement;

    async connectedCallback() {
        super.connectedCallback();
        Object.values(this.relFormatMedia).forEach(
            media =>
                (media.onchange = () => {
                    if (location.hash == "#timeline") this.requestUpdate();
                })
        );
        this.currentMember = await Cache.currentMember.get();
        this.members = (await Cache.members.get()) ?? [];
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        Object.values(this.relFormatMedia).forEach(media => (media.onchange = null));
    }

    firstUpdated = () => this.reset();

    reset = ({
        collapseAll = false,
        type = "middle"
    }: { collapseAll?: boolean; type?: "today" | "middle" | "noscroll" } = {}) => {
        this.minIndex = this.initialMinIndex;
        this.maxIndex = this.initialMaxIndex;
        this.dates = getDateRange(
            offsetDate(new Date(), this.minIndex),
            offsetDate(new Date(), this.maxIndex)
        );
        this.requestUpdate();
        if (collapseAll) this.collapseAll({ instant: true });
        if (type == "noscroll") return;
        this.handleScrolling = false;
        setTimeout(() => {
            if (type == "today") this.scrollToDate({ behavior: "instant" });
            else if (type == "middle")
                this.container.scroll({
                    top: (this.container.scrollHeight - this.container.clientHeight) / 2
                });
            this.handleScrolling = true;
        }, 1);
    };

    scrollToDate = ({
        date = new Date(),
        behavior = "smooth",
        block = "center",
        expand = false
    }: {
        date?: string | Date;
        behavior?: ScrollBehavior;
        block?: ScrollLogicalPosition;
        expand?: boolean;
    } = {}) => {
        date = new Date(date);
        const el = this.getDateEl(date);
        if (!el) {
            const [first, last] = [this.dates[0], this.dates.at(-1)];
            if (!first || !last) return;
            const onElsAdded = () => {
                if (this.getDateEl(date)) this.scrollToDate({ date, behavior, block, expand });
            };
            if (date < new Date(first)) this.prependDates({ targetDate: date, onElsAdded });
            else if (date > new Date(last)) this.appendDates({ targetDate: date, onElsAdded });
            return;
        }
        if (expand) instantly(el, () => el.toggleAttribute("data-expanded", true));
        el.scrollIntoView({ behavior, block });
    };

    recentre = () => {
        this.collapseAll();
        this.scrollToDate();
        this.container.onscrollend = () => {
            this.reset({ type: "noscroll" });
            this.container.onscrollend = null;
        };
    };

    getScrolledDirection = () => {
        const todayEl = this.getDateEl();
        if (!todayEl) return null;
        const [todayCentre, containerCentre] = [todayEl, this.container]
            .map(r => r.getBoundingClientRect())
            .map(r => r.top + r.height / 2) as [number, number];
        if (todayCentre == containerCentre) return null;
        return todayCentre > containerCentre ? "up" : "down";
    };

    toggleExpand = ({ date, e }: { date?: Date | string | null; e?: Event }) => {
        const dateEl = e ? queryClosest(e, "[data-date]") : this.getDateEl(date);
        date = date ? getDateString(date) : dateEl?.getAttribute("data-date");
        if (!dateEl || !date) return;

        const others = this.container.querySelectorAll<HTMLElement>(
            `[data-date][data-expanded]:not([data-date="${date}"])`
        );
        const expanded = dateEl?.toggleAttribute("data-expanded");
        if (expanded && others.length > 0)
            this.collapseAll({ exclude: dateEl, instant: true });
        others.forEach(el => this.handleExpand(el.dataset.date, false));

        this.dispatchEvent(new Event("userscroll"));
        if (!expanded) this.dispatchEvent(new Event("scrollend"));
        dateEl
            ?.querySelector<MdIcon>(".expand md-icon")
            ?.setIcon(expanded ? "keyboard_arrow_up" : "keyboard_arrow_down");
        if (expanded && dateEl?.dataset.date)
            this.scrollToDate({ date: dateEl?.dataset.date, block: "start" });
        this.handleExpand(date, expanded);
    };

    private handleExpand = async (date: string | undefined, expanded: boolean) => {
        if (!date) return;
        const li = this.container.querySelector(`li:has([data-date="${date}"])`);
        const assignmentsList = li?.querySelector("assignments-list");
        const turnsDialog = li?.querySelector("dialog");
        const turnsList = li?.querySelector("turns-list");
        const message = li?.querySelector("status-message");
        const stateActions = li?.querySelector("assignments-state-actions") ?? null;
        const addButton = li?.querySelector<HTMLButtonElement>("button.add") ?? null;

        if (!assignmentsList || !turnsList || !turnsDialog || !message) return;
        if (!expanded) {
            this.cleanupExpand(
                assignmentsList,
                stateActions,
                turnsDialog,
                turnsList,
                message,
                addButton
            );
            return;
        }

        const addAssignment = (e: Event) => {
            message.status = "success";
            assignmentsList.classList.add("animate");
            assignmentsList.addAssignment(e);
        };
        turnsList.removeEventListener("assignment-added", addAssignment);
        turnsList.addEventListener("assignment-added", addAssignment);

        message.elsToHide = [assignmentsList, stateActions];
        if (stateActions)
            Object.assign(stateActions, {
                assignmentsList,
                turnsList,
                message,
                addButton
            });
        message.status = "loading";
        addButton?.toggleAttribute("disabled", true);

        let turns = await getTurns(date);
        let assignments = await getAssignments(date, turns);
        if (turns == null || assignments == null) {
            message.status = "error";
            return;
        } else if (assignments.length == 0) message.status = "empty";
        else {
            message.status = "success";
            if (stateActions) Object.assign(stateActions, { assignments, turns });
            assignmentsList.assignments = cloneAndSum(assignments);
            setTimeout(() => assignmentsList.classList.add("animate"), 150);
        }
        addButton?.toggleAttribute("disabled", false);
        turnsList.turns = turns;
    };

    private cleanupExpand = (
        assignmentsList: AssignmentsList,
        stateActions: AssignmentsStateActions | null,
        turnsDialog: HTMLDialogElement,
        turnsList: TurnsList,
        message: StatusMessage,
        addButton: HTMLButtonElement | null
    ) => {
        assignmentsList.assignments = [];
        assignmentsList.classList.remove("animate");
        stateActions?.cancel();
        turnsDialog.close();
        turnsList.turns = [];
        message.removeAttribute("success");
        message.easterEggClicks = 0;
        addButton?.toggleAttribute("disabled", true);
    };

    private getRelFormatOpts = () => ({
        collapseDayName: this.relFormatMedia.collapseDayName.matches,
        collapseMonth: this.relFormatMedia.collapseMonth.matches,
        collapseDayNum: this.relFormatMedia.collapseDayNum.matches
    });

    private collapseAll = ({
        exclude,
        instant = false
    }: { exclude?: HTMLElement | null; instant?: boolean } = {}) => {
        const collapse = (el: HTMLElement) => {
            el.toggleAttribute("data-expanded", false);
            if (el.dataset.date) this.handleExpand(el.dataset.date, false);
        };
        const selector =
            "[data-date][data-expanded]" +
            (exclude?.dataset.date ? `:not([data-date="${exclude?.dataset.date}"])` : "");
        this.container.querySelectorAll<HTMLElement>(selector).forEach(el => {
            if (instant) instantly([el, el.parentElement!], () => collapse(el));
            else collapse(el);
            el.querySelector<MdIcon>(".expand md-icon")?.setIcon("keyboard_arrow_down");
        });
    };

    private getDateEl = (date?: Date | string | null) =>
        this.container.querySelector<HTMLElement>(
            `[data-date="${getDateString(date ?? new Date())}"]`
        );

    private prependDates = ({
        targetDate = new Date(),
        onElsAdded = () => {}
    }: { targetDate?: Date | string; onElsAdded?: () => void } = {}) => {
        this.handleScrolling = false;
        if (!this.dates[0]) return;

        const oldScrollHeight = this.container.scrollHeight;
        const oldScrollTop = this.container.scrollTop;
        const firstDate = offsetDate(targetDate, this.minIndex - this.batchSize);
        const newDates = getDateRange(firstDate, offsetDate(this.dates[0], -1));

        this.minIndex -= newDates.length;
        this.dates = [...newDates, ...this.dates];

        this.updateComplete.then(() => {
            const newScrollHeight = this.container.scrollHeight;
            this.container.scroll(0, oldScrollTop + (newScrollHeight - oldScrollHeight));
            if (this.getDateEl(firstDate)) onElsAdded();
            this.handleScrolling = true;
        });
    };

    private appendDates = ({
        targetDate = new Date(),
        onElsAdded = () => {}
    }: { targetDate?: Date | string; onElsAdded?: () => void } = {}) => {
        if (!this.dates.at(-1)) return;
        const lastDate = offsetDate(targetDate, this.maxIndex + this.batchSize);
        const newDates = getDateRange(offsetDate(this.dates.at(-1)!, 1), lastDate);

        this.maxIndex += newDates.length;
        this.dates = [...this.dates, ...newDates];

        this.updateComplete.then(() => {
            if (this.getDateEl(lastDate)) onElsAdded();
        });
    };

    private handleScroll = () => {
        if (!this.handleScrolling) return;
        this.dispatchEvent(new Event("scroll"));
        const { scrollTop, scrollHeight, clientHeight } = this.container;
        if (scrollTop < this.threshold) this.prependDates();
        else if (scrollHeight - (scrollTop + clientHeight) < this.threshold)
            this.appendDates();
    };

    render = () => html`
        <ol
            @scroll=${this.handleScroll}
            @scrollend=${() => this.dispatchEvent(new Event("scrollend"))}
            @wheel=${() => this.dispatchEvent(new Event("userscroll"))}
            @pointermove=${(e: PointerEvent) => {
                if (e.pointerType != "mouse") this.dispatchEvent(new Event("userscroll"));
            }}>
            ${repeat(
                this.dates,
                d => d,
                d => {
                    let dialog: HTMLDialogElement;
                    return html`
                        <li>
                            <dialog
                                closedby="any"
                                ${ref<HTMLDialogElement>(el => (dialog = el))}>
                                <div>
                                    <h2>
                                        <span class="prefix">Turns</span>
                                        ${formatDateRelative(d, {
                                            collapseDayName: true,
                                            collapseMonth: true,
                                            collapseDayNum: true
                                        })}
                                    </h2>
                                    <button class="done filled" @click=${() => dialog.close()}>
                                        <md-icon>check</md-icon><span>Done</span>
                                    </button>
                                </div>
                                <turns-list date=${d}></turns-list>
                            </dialog>
                            <div
                                data-date=${d}
                                @click=${(e: Event) => this.toggleExpand({ e })}>
                                <span class="rel-date">
                                    ${formatDateRelative(d, this.getRelFormatOpts())}
                                </span>
                                <md-icon
                                    class="birthday"
                                    ?hidden=${!getBirthdaysMatch(this.members, d)}>
                                    cake
                                </md-icon>
                                ${this.currentMember?.isAdmin || d == getDateString()
                                    ? html`
                                          <button
                                              class="add filled"
                                              tabindex="-1"
                                              @click=${(e: Event) => {
                                                  e.stopPropagation();
                                                  dialog.showModal();
                                              }}>
                                              <md-icon>add</md-icon><span>Add</span>
                                          </button>
                                          <assignments-state-actions date=${d}>
                                          </assignments-state-actions>
                                      `
                                    : ""}
                                <span class="short-date">${formatDateShort(d)}</span>
                                <button class="expand transparent" tabindex="-1">
                                    <md-icon>keyboard_arrow_down</md-icon>
                                </button>
                            </div>
                            <assignments-list></assignments-list>
                            <status-message hide-retry easter-egg></status-message>
                        </li>
                    `;
                }
            )}
        </ol>
    `;
}
