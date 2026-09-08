import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { instantly, queryClosest } from "../functions/element-utils";
import { Cache } from "../classes/cache";
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
    private handleScrolling = true;
    private readonly relFormatMedia = {
        collapseWeekday: matchMedia("(width <= 450px)"),
        collapseMonth: matchMedia("(width <= 650px)"),
        collapseDay: matchMedia("(width <= 350px)")
    };
    private get relFormatOpts() {
        return {
            collapseWeekday: this.relFormatMedia.collapseWeekday.matches,
            collapseMonth: this.relFormatMedia.collapseMonth.matches,
            collapseDay: this.relFormatMedia.collapseDay.matches
        };
    }
    @query(":scope > ol") private container!: HTMLElement;
    @state() private dates: string[] = [];
    @state() private minIndex = this.initialMinIndex;
    @state() private maxIndex = this.initialMaxIndex;
    @state() private members: UiMember[] = [];

    async connectedCallback() {
        super.connectedCallback();
        Object.values(this.relFormatMedia).forEach(
            media =>
                (media.onchange = () => {
                    if (location.hash == "#timeline") this.requestUpdate();
                })
        );
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

    toggleExpand = ({ date, e }: { date?: Date | string; e?: Event }) => {
        const dateEl = e ? queryClosest(e, "[data-date]") : this.getDateEl(date);
        const expanded = dateEl?.toggleAttribute("data-expanded");
        if (expanded) this.collapseAll({ exclude: dateEl, instant: true });
        dateEl
            ?.querySelector<MdIcon>(".expand md-icon")
            ?.setIcon(expanded ? "keyboard_arrow_up" : "keyboard_arrow_down");
        if (expanded && dateEl?.dataset.date)
            this.scrollToDate({ date: dateEl?.dataset.date, block: "start" });
    };

    private collapseAll = ({
        exclude,
        instant = false
    }: { exclude?: HTMLElement | null; instant?: boolean } = {}) => {
        const toggle = (el: HTMLElement) => el.toggleAttribute("data-expanded", false);
        const selector = exclude?.dataset.date
            ? `[data-date]:not([data-date="${exclude?.dataset.date}"])`
            : "[data-date]";
        this.container.querySelectorAll<HTMLElement>(selector).forEach(el => {
            if (instant) instantly([el, el.parentElement!], () => toggle(el));
            else toggle(el);
            el.querySelector<MdIcon>(".expand md-icon")?.setIcon("keyboard_arrow_down");
        });
    };

    private getDateEl = (date: Date | string = new Date()) =>
        this.container.querySelector<HTMLElement>(`[data-date="${getDateString(date)}"]`);

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
                d => html`
                    <li>
                        <div data-date=${d} @click=${(e: Event) => this.toggleExpand({ e })}>
                            <span class="rel-date">
                                ${formatDateRelative(d, this.relFormatOpts)}
                            </span>
                            ${getBirthdaysMatch(this.members, d)
                                ? html`<md-icon class="birthday">cake</md-icon>`
                                : ""}
                            <state-actions .conf=${{}}></state-actions>
                            <span class="short-date">${formatDateShort(d)}</span>
                            <button class="expand transparent" tabindex="-1">
                                <md-icon>keyboard_arrow_down</md-icon>
                            </button>
                        </div>
                    </li>
                `
            )}
        </ol>
    `;
}
