import { LitElement, html } from "lit";
import { customElement, property } from "lit/decorators.js";
import { delay } from "../functions/timer.js";
import { withTransition } from "../functions/element-utils.js";

export type ButtonConf = {
    icon?: string;
    spin?: boolean;
    label?: string;
    click?: (e?: Event) => (void | boolean) | Promise<void | boolean>;
    withTransition?: boolean;
};
export type IndicatorConf = {
    icon?: string;
    spin?: boolean;
    label?: string;
    msToShow?: number;
};
export type Conf = {
    normal?: ButtonConf;
    active?: ButtonConf;
    loading?: IndicatorConf;
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
        active: { icon: "save", label: "Save", withTransition: true },
        loading: { icon: "sync", spin: true, label: "Saving" },
        success: { icon: "check", label: "Saved", msToShow: 1000 },
        error: { icon: "error", label: "Failed", msToShow: 1500 },
        cancel: { icon: "close", label: "Cancel" }
    };

    readonly handleResult = async (success: boolean | void | undefined) => {
        if (this.conf.success && this.conf.error && typeof success == "boolean") {
            this.state = success ? "success" : "error";
            await delay(this.getConf("msToShow") ?? 0);
        }
        this.state = "normal";
    };

    readonly cancel = async (e?: Event) => {
        this.state = "normal";
        await this.conf.cancel?.click?.(e);
    };

    readonly getConf = <K extends keyof (ButtonConf & IndicatorConf)>(
        key: K,
        state: State | "cancel" = this.state
    ) => {
        const conf = this.conf[state] as (ButtonConf & IndicatorConf) | undefined;
        const defaultConf = this.defaultConf[state] as ButtonConf & IndicatorConf;
        return conf?.[key] ?? defaultConf[key] ?? null;
    };

    private readonly handleCancelClick = async (e: Event) => {
        e.stopPropagation();
        if (this.getConf("withTransition", "cancel"))
            await withTransition(e.currentTarget, {
                after: async () => await this.cancel(e)
            });
        else this.cancel(e);
    };

    private readonly handleStateClick = async (e: Event) => {
        e.stopPropagation();
        if (this.state == "normal" && this.conf.active) {
            this.state = "active";
            await this.conf.normal?.click?.(e);
            return;
        }
        const run = async () => {
            const type = this.state == "normal" ? "normal" : "active";
            this.state = this.conf.loading ? "loading" : this.state;
            this.handleResult(await this.conf[type]?.click?.(e));
        };
        if (this.getConf("withTransition"))
            await withTransition(e.currentTarget, { after: run });
        else await run();
    };

    render = () => html`
        <button
            data-cancel
            class=${this.cancelClass ?? "outlined"}
            ?hidden=${this.state != "active" || !this.conf.cancel}
            @click=${this.handleCancelClick}>
            <md-icon>${this.getConf("icon", "cancel")}</md-icon>
            <span>${this.getConf("label", "cancel")}</span>
        </button>
        <button
            data-state
            class=${this.stateClass ?? "filled"}
            ?disabled=${["loading", "error", "success"].includes(this.state)}
            @click=${this.handleStateClick}>
            <md-icon ?spin=${this.getConf("spin")}>${this.getConf("icon")}</md-icon>
            <span>${this.getConf("label")}</span>
        </button>
    `;
}
