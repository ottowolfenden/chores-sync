import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { delay } from "../functions/timer.js";
import { withTransition } from "../functions/element-utils.js";

export type ButtonConf = {
    icon?: string;
    label?: string;
    click?: (e?: Event) => (void | boolean) | Promise<void | boolean>;
};
export type IndicatorConf = { icon?: string; label?: string; msToShow?: number };
export type Conf = {
    normal?: ButtonConf;
    active?: ButtonConf;
    loading?: Omit<IndicatorConf, "msToShow">;
    error?: IndicatorConf;
    success?: IndicatorConf;
    cancel?: ButtonConf;
};
export type State = "normal" | "active" | "loading" | "success" | "error";

@customElement("state-actions")
export class StateActions extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: Object, attribute: "conf" }) conf: Conf = {};
    @property({ type: String, attribute: "cancel-button-class" }) cancelClass?: string;
    @property({ type: String, attribute: "state-button-class" }) stateClass?: string;
    @property({ type: String, attribute: "state", reflect: true }) state: State = "normal";

    readonly defaultConf: Required<Conf> = {
        normal: { icon: "", label: "" },
        active: { icon: "save", label: "Save" },
        loading: { icon: "cloud_upload", label: "Saving" },
        success: { icon: "check", label: "Saved", msToShow: 1000 },
        error: { icon: "error", label: "Failed", msToShow: 1500 },
        cancel: { icon: "close", label: "Cancel" }
    };

    readonly handleResult = async (success: boolean | void | undefined) => {
        if (this.conf.success && this.conf.error && typeof success == "boolean") {
            this.state = success ? "success" : "error";
            await delay(
                this.conf?.[this.state]?.msToShow ?? this.defaultConf[this.state].msToShow ?? 0
            );
        }
        this.state = "normal";
    };

    readonly cancel = async (e?: Event) => {
        this.state = "normal";
        await this.conf.cancel?.click?.(e);
    };

    render = () => html`
        <button
            data-cancel
            class=${this.cancelClass ?? "outlined"}
            ?hidden=${this.state != "active" || !this.conf.cancel}
            @click=${async (e: Event) => {
                e.stopPropagation();
                this.cancel(e);
            }}>
            <md-icon>${this.conf.cancel?.icon ?? this.defaultConf.cancel?.icon}</md-icon>
            <span>${this.conf.cancel?.label ?? this.defaultConf.cancel?.label}</span>
        </button>
        <button
            data-state
            class=${this.stateClass ?? "filled"}
            ?disabled=${["loading", "error", "success"].includes(this.state)}
            @click=${async (e: Event) => {
                e.stopPropagation();
                if (this.state == "normal" && this.conf.active) {
                    this.state = "active";
                    await this.conf.normal?.click?.(e);
                    return;
                }
                withTransition(e.currentTarget as HTMLElement, undefined, async () => {
                    const type = this.state == "normal" ? "normal" : "active";
                    this.state = this.conf.loading ? "loading" : this.state;
                    this.handleResult(await this.conf[type]?.click?.(e));
                });
            }}>
            <md-icon>
                ${this.conf[this.state]?.icon ?? this.defaultConf[this.state].icon}
            </md-icon>
            <span>
                ${this.conf[this.state]?.label ?? this.defaultConf[this.state].label}
            </span>
        </button>
    `;
}
