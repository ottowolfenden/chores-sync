import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { Timer } from "../services/timer.js";

type Conf = { icon?: string; label?: string };
type ButtonConf = Conf & {
    click?: (e?: Event) => (void | boolean) | Promise<void | boolean>;
};
type IndicatorConf = Conf & { msToShow?: number };

@customElement("state-actions")
export class StateActions extends LitElement {
    protected createRenderRoot = () => this;

    @property({ type: String, attribute: "state", reflect: true })
    state: "normal" | "active" | "loading" | "success" | "error" = "normal";

    @property({ type: Object }) conf: {
        normal?: ButtonConf;
        active?: ButtonConf;
        loading?: Conf;
        error?: IndicatorConf;
        success?: IndicatorConf;
        cancel?: ButtonConf;
    } = {};

    defaultConf = {
        normal: { icon: "", label: "" },
        active: { icon: "save", label: "Save" },
        loading: { icon: "cloud_upload", label: "Saving" },
        success: { icon: "check", label: "Saved", msToShow: 1000 },
        error: { icon: "error", label: "Failed", msToShow: 1500 },
        cancel: { icon: "close", label: "Cancel" }
    } as const;

    render = () => html`
        <button
            class="tonal"
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
                    this.state = this.conf.active ? "active" : this.state;
                    await this.conf.normal?.click?.(e);
                } else if (this.state == "active") {
                    this.state = this.conf.loading ? "loading" : this.state;
                    const success = await this.conf.active?.click?.(e);
                    if (this.conf.success && this.conf.error && typeof success == "boolean") {
                        this.state = success ? "success" : "error";
                        await Timer.delay(
                            this.conf?.[this.state]?.msToShow ??
                                this.defaultConf[this.state].msToShow
                        );
                    }
                    this.state = "normal";
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
