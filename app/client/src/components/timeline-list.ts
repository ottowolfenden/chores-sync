import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { instantly, queryClosest } from "../functions/element-utils";
import {
    getDateRange,
    getDateString,
    offsetDate,
    formatDateRelative,
    formatDateShort
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
    @query(":scope > div") private container!: HTMLElement;
    @state() private dates: string[] = [];
    @state() private minIndex = this.initialMinIndex;
    @state() private maxIndex = this.initialMaxIndex;

    connectedCallback() {
        super.connectedCallback();
        Object.values(this.relFormatMedia).forEach(
            media =>
                (media.onchange = () => {
                    if (location.hash == "#timeline") this.requestUpdate();
                })
        );
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
        if (collapseAll)
            this.container
                .querySelectorAll<HTMLElement>(":scope > div")
                .forEach(el =>
                    instantly(el, () => el.toggleAttribute("data-expanded", false))
                );
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
        expand = false
    }: {
        date?: string | Date;
        behavior?: ScrollBehavior;
        expand?: boolean;
    } = {}) => {
        date = new Date(date);
        const el = this.getDateEl(date);
        if (!el) {
            const [first, last] = [this.dates[0], this.dates.at(-1)];
            if (!first || !last) return;
            const onElsAdded = () => {
                if (this.getDateEl(date)) this.scrollToDate({ date, behavior, expand });
            };
            if (date < new Date(first)) this.prependDates({ targetDate: date, onElsAdded });
            else if (date > new Date(last)) this.appendDates({ targetDate: date, onElsAdded });
            return;
        }
        if (expand) instantly(el, () => el.toggleAttribute("data-expanded", true));
        el.scrollIntoView({ behavior, block: "center" });
    };

    recentre = () => {
        this.scrollToDate();
        this.container.onscrollend = () => {
            this.reset({ type: "noscroll" });
            this.container.onscrollend = null;
        };
    };

    private getDateEl = (date: Date | string) =>
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
        const { scrollTop, scrollHeight, clientHeight } = this.container;
        if (scrollTop < this.threshold) this.prependDates();
        else if (scrollHeight - (scrollTop + clientHeight) < this.threshold)
            this.appendDates();
    };

    render = () => {
        return html`
            <div @scroll=${this.handleScroll}>
                ${repeat(
                    this.dates,
                    d => d,
                    d => html`
                        <div
                            data-date=${d}
                            @click=${(e: Event) =>
                                (e.target as HTMLElement).toggleAttribute("data-expanded")}>
                            <span class="rel-date">
                                ${formatDateRelative(d, this.relFormatOpts)}
                            </span>
                            <span class="short-date">${formatDateShort(d)}</span>
                            <button
                                class="expand transparent"
                                tabindex="-1"
                                @click=${(e: Event) =>
                                    queryClosest(e, "[data-date]")?.toggleAttribute(
                                        "data-expanded"
                                    )}>
                                <md-icon>${"keyboard_arrow_down"}</md-icon>
                            </button>
                        </div>
                    `
                )}
            </div>
        `;
    };
}
