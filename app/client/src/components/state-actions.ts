import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { delay } from "../functions/timer.js";

type ButtonConf = {
    icon?: string;
    label?: string;
    click?: (e?: Event) => (void | boolean) | Promise<void | boolean>;
};
type IndicatorConf = { icon?: string; label?: string; msToShow?: number };
type Conf = {
    normal?: ButtonConf;
    active?: ButtonConf;
    loading?: Omit<IndicatorConf, "msToShow">;
    error?: IndicatorConf;
    success?: IndicatorConf;
    cancel?: ButtonConf;
};

@customElement("state-actions")
export class StateActions extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: String, attribute: "state", reflect: true })
    state: "normal" | "active" | "loading" | "success" | "error" = "normal";

    @property({ type: Object }) conf: Conf = {};

    readonly defaultConf: Required<Conf> = {
        normal: { icon: "", label: "" },
        active: { icon: "save", label: "Save" },
        loading: { icon: "cloud_upload", label: "Saving" },
        success: { icon: "check", label: "Saved", msToShow: 1000 },
        error: { icon: "error", label: "Failed", msToShow: 1500 },
        cancel: { icon: "close", label: "Cancel" }
    };

    private handleResult = async (success: boolean | void | undefined) => {
        if (this.conf.success && this.conf.error && typeof success == "boolean") {
            this.state = success ? "success" : "error";
            await delay(
                this.conf?.[this.state]?.msToShow ?? this.defaultConf[this.state].msToShow ?? 0
            );
        }
        this.state = "normal";
    };

    render = () => html`
        <button
            class="outlined"
            ?hidden=${this.state != "active" || !this.conf.cancel}
            @click=${async () => {
                this.state = "normal";
                await this.conf.cancel?.click?.();
            }}>
            <md-icon>${this.conf.cancel?.icon ?? this.defaultConf.cancel?.icon}</md-icon>
            <span>${this.conf.cancel?.label ?? this.defaultConf.cancel?.label}</span>
        </button>
        <button
            class="filled"
            ?disabled=${["loading", "error", "success"].includes(this.state)}
            @click=${async (e: Event) => {
                if (this.state == "normal") {
                    if (this.conf.active) {
                        this.state = "active";
                        await this.conf.normal?.click?.(e);
                        return;
                    }
                    this.state = this.conf.loading ? "loading" : this.state;
                    this.handleResult(await this.conf.normal?.click?.(e));
                } else if (this.state == "active") {
                    this.state = this.conf.loading ? "loading" : this.state;
                    this.handleResult(await this.conf.active?.click?.(e));
                }
            }}>
            <md-icon>
                ${this.conf[this.state]?.icon ?? this.defaultConf[this.state]?.icon}
            </md-icon>
            <span>
                ${this.conf[this.state]?.label ?? this.defaultConf[this.state]?.label}
            </span>
        </button>
    `;
}
