import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { repeat } from "lit/directives/repeat.js";
import { getDateRange, getDateString, offsetDate } from "../functions/date-utils";

@customElement("timeline-list")
export class TimelineList extends LitElement {
    protected createRenderRoot = () => this;

    @query(":scope > div") private container!: HTMLElement;
    @state() private dates: string[] = [];
    @state() private minIndex = -20;
    @state() private maxIndex = 20;
    private isPrepending = false;
    private readonly threshold = 200;
    private readonly batchSize = 15;

    connectedCallback() {
        super.connectedCallback();
        this.dates = getDateRange(
            offsetDate(new Date(), this.minIndex),
            offsetDate(new Date(), this.maxIndex)
        );
    }

    firstUpdated = () => this.scrollToDate();

    private getDateEl = (date: Date | string) =>
        this.container.querySelector(`[data-date="${getDateString(date)}"]`);

    scrollToDate = (opts?: {
        date?: string | Date;
        behavior?: ScrollBehavior;
        expand?: boolean;
    }) => {
        const date = new Date(opts?.date ?? new Date());
        const el = this.getDateEl(date);
        if (!el) {
            const [first, last] = [this.dates[0], this.dates.at(-1)];
            if (!first || !last) return;
            const onElsAdded = () => {
                if (this.getDateEl(date)) this.scrollToDate(opts);
            };
            if (date < new Date(first)) this.prependDates({ firstDate: date, onElsAdded });
            else if (date > new Date(last)) this.appendDates({ lastDate: date, onElsAdded });
            return;
        }
        if (opts && opts.expand) el.toggleAttribute("data-expanded", true);
        el.scrollIntoView({ behavior: opts?.behavior ?? "smooth", block: "center" });
    };

    private prependDates = (opts?: { firstDate: Date | string; onElsAdded: () => void }) => {
        this.isPrepending = true;

        if (!this.dates[0]) return;

        const oldScrollHeight = this.container.scrollHeight;
        const oldScrollTop = this.container.scrollTop;
        const firstDate = offsetDate(
            opts?.firstDate ?? new Date(),
            this.minIndex - this.batchSize
        );
        const newDates = getDateRange(firstDate, this.dates[0]);

        this.minIndex -= newDates.length;
        this.dates = [...newDates, ...this.dates];

        this.updateComplete.then(() => {
            const newScrollHeight = this.container.scrollHeight;
            this.container.scroll(0, oldScrollTop + (newScrollHeight - oldScrollHeight));
            if (opts && this.getDateEl(firstDate)) opts.onElsAdded();
            this.isPrepending = false;
        });
    };

    private appendDates = (opts?: { lastDate: Date | string; onElsAdded: () => void }) => {
        if (!this.dates.at(-1)) return;
        const lastDate = offsetDate(
            opts?.lastDate ?? new Date(),
            this.maxIndex + this.batchSize
        );
        const newDates = getDateRange(this.dates.at(-1)!, lastDate);
        this.maxIndex += newDates.length;
        this.dates = [...this.dates, ...newDates];
        this.updateComplete.then(() => {
            if (opts && this.getDateEl(lastDate)) opts.onElsAdded();
        });
    };

    private handleScroll = () => {
        if (this.isPrepending) return;
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
                d =>
                    html`<div
                        data-date=${d}
                        @click=${(e: Event) =>
                            (e.target as HTMLElement).toggleAttribute("data-expanded")}>
                        ${d}
                    </div>`
            )}
        </div>
    `;
}
