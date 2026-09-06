import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { getDateRange, getDateString, offsetDate } from "../functions/date-utils";
import { instantly } from "../functions/element-utils";

@customElement("timeline-list")
export class TimelineList extends LitElement {
    protected createRenderRoot = () => this;

    private readonly initialMinIndex = -50;
    private readonly initialMaxIndex = 50;
    private readonly threshold = 200;
    private readonly batchSize = 15;
    private handleScrolling = true;
    @query(":scope > div") private container!: HTMLElement;
    @state() private dates: string[] = [];
    @state() private minIndex = this.initialMinIndex;
    @state() private maxIndex = this.initialMaxIndex;

    firstUpdated = () => this.reset();

    reset = ({ collapseAll = false }: { collapseAll?: boolean } = {}) => {
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
        this.handleScrolling = false;
        setTimeout(() => {
            if (collapseAll) this.scrollToDate({ behavior: "instant" });
            else
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

    render = () => html`
        <div @scroll=${this.handleScroll}>
            ${repeat(
                this.dates,
                d => d,
                d => html`
                    <div
                        data-date=${d}
                        @click=${(e: Event) =>
                            (e.target as HTMLElement).toggleAttribute("data-expanded")}>
                        ${d}
                    </div>
                `
            )}
        </div>
    `;
}
