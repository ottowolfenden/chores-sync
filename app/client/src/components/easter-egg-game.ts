import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { delay, throttle } from "../functions/timer";

export type Step = { delay: number; allowed: ["top"] | ["bottom"] | ["top", "bottom"] };

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    @query(".player") private player!: MdIcon;
    private active = false;
    private running = false;
    private runId = 0;
    private pos: "top" | "bottom" = "bottom";
    private steps: Step[] = [
        { delay: 1000, allowed: ["top", "bottom"] },
        { delay: 4000, allowed: ["top"] }
    ];

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

    private start = async () => {
        if (!this.active || this.running) return;
        this.running = true;
        const id = ++this.runId;
        console.log("started");

        for (const step of this.steps) {
            await delay(step.delay);
            if (id != this.runId) return;
            console.log(step.allowed);
        }
        this.stop();
    };

    private stop = () => {
        this.running = false;
        this.runId++;
        console.log("stopped");
    };

    private handleKeydown = (e: KeyboardEvent) => {
        if (["Enter", " "].includes(e.key)) (this.running ? this.handlePress : this.start)();
        else if (e.key == "s") this.stop();
    };

    private handlePress = throttle(() => {
        this.pos = this.pos == "top" ? "bottom" : "top";
        this.player.style.animationName = `jump-to-${this.pos}`;
    }, 400);

    render = () => html`
        <div class="stats"></div>
        <div
            class="container"
            @mousedown=${() => (this.running ? this.handlePress : this.start)()}>
            <md-icon class="player">directions_bike</md-icon>
            <!-- <div class="platform"></div>
            <div class="platform" data-top></div> -->
        </div>
    `;
}
