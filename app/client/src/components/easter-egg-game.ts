import { LitElement, html } from "lit";
import { customElement, query } from "lit/decorators.js";
import { delay, throttle } from "../functions/timer";
import { instantly } from "../functions/element-utils";

export type Pos = "top" | "bottom";
export type Step = { delay: number; pos?: Pos };

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    @query(".player") private player!: MdIcon;
    private active = false;
    private running = false;
    private runId = 0;
    private pos: Pos = "bottom";
    private steps: Step[] = [{ delay: 1000 }, { delay: 3000, pos: "top" }];

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
            console.log(step.pos);
            if (step.pos && step.pos != this.pos) {
                console.log("fail");
                break;
            }
        }
        this.stop();
    };

    private stop = () => {
        this.running = false;
        this.runId++;
        if (this.pos == "top")
            instantly(this.player, () => (this.player.style.animationName = "jump-to-bottom"));
        this.pos = "bottom";
        this.player.onanimationend = null;
        console.log("finished successfully");
    };

    private invert = (pos: Pos): Pos => (pos == "top" ? "bottom" : "top");

    private handleKeydown = (e: KeyboardEvent) => {
        if (["Enter", " "].includes(e.key)) (this.running ? this.handlePress : this.start)();
        else if (e.key == "s") this.stop();
    };

    private handlePress = throttle(() => {
        this.player.style.animationName = `jump-to-${this.invert(this.pos)}`;
        this.player.onanimationend = () => (this.pos = this.invert(this.pos));
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
