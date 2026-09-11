import { LitElement, html, nothing } from "lit";
import { customElement, query, state } from "lit/decorators.js";
import { delay, throttle } from "../functions/timer";
import { instantly } from "../functions/element-utils";
import { repeat } from "lit/directives/repeat.js";

export type Pos = "top" | "bottom";
export type Step = { id: number; time: number; pos?: Pos };

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    @query(".player") private player!: MdIcon;
    @state() private running = false;
    private active = false;
    private runId = 0;
    private pos: Pos = "bottom";
    private steps: Step[] = [
        { id: 0, time: 1000 },
        { id: 1, time: 2000, pos: "bottom" },
        { id: 2, time: 3000, pos: "top" },
        { id: 3, time: 4000 },
        { id: 4, time: 5000, pos: "bottom" }
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

        let prevTime = 0;

        for (const step of this.steps) {
            await delay(step.time - prevTime);
            if (id != this.runId) return;
            this.requestUpdate();
            console.log(this.steps);
            console.log({
                step: step.id,
                expected: step.pos,
                actual: this.pos
            });
            if (step.pos && step.pos != this.pos) {
                console.log("fail");
                this.stop();
                break;
            }
            prevTime = step.time;
        }
        console.log("finished successfully");
        this.stop();
    };

    private stop = () => {
        this.running = false;
        this.runId++;
        instantly(this.player, () => (this.player.style.animationName = "jump-to-bottom"));
        this.pos = "bottom";
        this.player.onanimationend = null;
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
            ${this.running
                ? html`
                      <div class="track">
                          ${repeat(
                              this.steps,
                              s => s.id,
                              s => html`
                                  <div class="step">
                                      ${s.pos !== "bottom"
                                          ? html` <div class="platform top"></div> `
                                          : nothing}
                                      ${s.pos !== "top"
                                          ? html` <div class="platform bottom"></div> `
                                          : nothing}
                                  </div>
                              `
                          )}
                      </div>
                  `
                : html`
                      <div class="platform top"></div>
                      <div class="platform bottom"></div>
                  `}
        </div>
    `;
}
