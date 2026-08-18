import { LitElement, html } from "lit";
import { customElement, property, query } from "lit/decorators.js";

@customElement("num-input")
export class NumInput extends LitElement {
    protected createRenderRoot = () => this;

    @query("input")
    private inputEl!: HTMLInputElement;

    @property({ type: String }) name = "";
    @property({ type: Number }) value = 0;
    @property({ type: Number }) min?: number;
    @property({ type: Number }) max?: number;
    @property({ type: Number }) step = 1;
    @property({ type: Boolean }) disabled = false;

    private handleStep = (inputFunction: "stepUp" | "stepDown") => {
        if (this.disabled) return;
        this.inputEl[inputFunction]();
        this.value = Number(this.inputEl.value);
        this.dispatchEvent(new Event("input", { bubbles: true }));
        this.dispatchEvent(new Event("change", { bubbles: true }));
    };

    private handleInput = (e: Event) =>
        (this.value = Number((e.target as HTMLInputElement).value));

    render = () => html`
        <button
            class="minus tonal small"
            ?disabled=${this.disabled}
            @click=${() => this.handleStep("stepDown")}>
            <md-icon>remove</md-icon>
        </button>
        <input
            type="number"
            name=${this.name}
            .value=${this.value.toString()}
            .min=${this.min?.toString() ?? ""}
            .max=${this.max?.toString() ?? ""}
            .step=${this.step.toString()}
            ?disabled=${this.disabled}
            @input=${this.handleInput}
            @click=${() => this.inputEl.select()} />
        <button
            class="plus tonal small"
            ?disabled=${this.disabled}
            @click=${() => this.handleStep("stepUp")}>
            <md-icon>add</md-icon>
        </button>
    `;
}
