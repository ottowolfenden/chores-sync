import { LitElement, html } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { throttle } from "../functions/timer";

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    @query(".player") private player!: MdIcon;
    @state() private active = false;
    @state() private started = false;
    private pos: "top" | "bottom" = "bottom";

    disconnectedCallback() {
        super.disconnectedCallback();
        this.deactivate();
    }

    activate = () => {
        document.removeEventListener("keydown", this.handleKeydown);
        document.addEventListener("keydown", this.handleKeydown);
        this.active = true;
    };

    deactivate = () => {
        document.removeEventListener("keydown", this.handleKeydown);
        this.stop();
        this.active = false;
    };

    private start = () => {
        if (!this.active) return;
        this.started = true;
    };

    private stop = () => {
        this.started = false;
    };

    private handleKeydown = (e: KeyboardEvent) => {
        if (["Enter", " "].includes(e.key)) (this.started ? this.handlePress : this.start)();
    };

    private handlePress = throttle(() => {
        this.player.style.animationName = this.pos == "top" ? "flip-down" : "flip-up";
        this.pos = this.pos == "top" ? "bottom" : "top";
    }, 400);

    render = () => html`
        <div class="stats"></div>
        <div
            class="container"
            @mousedown=${(() => (this.started ? this.handlePress : this.start))()}>
            <md-icon class="player">directions_bike</md-icon>
            <div class="platform"></div>
            <div class="platform" data-top></div>
        </div>
    `;
}
