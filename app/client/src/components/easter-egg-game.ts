import { LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { getRandFrom, getRandInt, getRandsFrom, shuffle } from "../functions/rand-utils";
import { withTransition } from "../functions/element-utils";
import { updateEasterEggHighScore } from "../functions/db-set";
import materialSymbols from "../assets/material-symbols.json";
import "../components/life-counter";

export type Symbol = { icon: string; rotation: number };
export type Card = { symbols: Symbol[]; variation: 1 | 2 | 3 | 4 | 5; rotation: number };

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    private readonly numPerCard = 8;
    private readonly duration = 60_000;
    private readonly maxLives = 3;
    private readonly penalty = 2000;
    private readonly boost = 3000;
    private timer?: number;
    private endTime: number = Infinity;

    @property({ type: String, reflect: true }) state: "new" | "running" | "finished" = "new";
    @property({ type: Array }) members?: UiMember[] | null;
    @property({ type: Object }) currentMember?: UiMember | null;

    @state() private timeRemaining = this.duration;
    @state() private cards: Card[] = [];
    @state() private score = 0;
    @state() private lives = this.maxLives;

    @query(".cards-container") private cardsContainer!: HTMLDivElement;

    start = () => {
        if (this.state == "running") return;
        this.generateCards();
        this.state = "running";
        this.endTime = Date.now() + this.duration;
        this.timer = setInterval(() => {
            this.timeRemaining = Math.max(this.endTime - Date.now(), 0);
            if (this.timeRemaining == 0) this.stop();
        }, 200);
    };

    stop = () => {
        this.state = "finished";
        clearInterval(this.timer);
        this.cards = [];
        if (this.currentMember && this.score > this.currentMember.easterEggHighScore) {
            this.currentMember.easterEggHighScore = this.score;
            updateEasterEggHighScore(this.currentMember);
        }
    };

    reset = () => {
        this.stop();
        this.state = "new";
        this.timeRemaining = this.duration;
        this.lives = this.maxLives;
        this.score = 0;
    };

    private generateCards = () => {
        let symbols = [
            ...new Set(materialSymbols.find(obj => obj.for == "easter-egg")?.icons)
        ];
        const match = getRandFrom(symbols);
        if (!match) return;
        const symbols1 = getRandsFrom(
            symbols.filter(s => s != match),
            this.numPerCard - 1
        );
        const symbols2 = getRandsFrom(
            symbols.filter(s => s != match && !symbols1.some(s1 => s1 == s)),
            this.numPerCard - 1
        );
        this.cards = [symbols1, symbols2].map(symbols => ({
            symbols: shuffle([match, ...symbols]).map(icon => ({
                icon,
                rotation: getRandInt(0, 360)
            })),
            variation: getRandInt(1, 5) as 1 | 2 | 3 | 4 | 5,
            rotation: getRandInt(0, 360)
        }));
    };

    private checkMatch = (symbol: Symbol) =>
        this.cards.flatMap(c => c.symbols).filter(s => s.icon == symbol.icon).length == 2;

    private checkDanger = () =>
        this.timeRemaining <= 0.2 * this.duration && this.timeRemaining != 0;

    private getHighScore = () =>
        this.currentMember
            ? Math.max(this.currentMember.easterEggHighScore, this.score)
            : null;

    private handleChoice = (symbol: Symbol) =>
        withTransition(this.cardsContainer.querySelector("button"), {
            before: () => this.cardsContainer.classList.add("replacing"),
            after: () => {
                if (this.checkMatch(symbol)) {
                    this.score++;
                    this.timeRemaining = Math.min(
                        this.timeRemaining + this.boost,
                        this.duration
                    );
                    this.endTime += this.boost;
                } else {
                    this.lives--;
                    this.timeRemaining = Math.max(this.timeRemaining - this.penalty, 0);
                    this.endTime = Math.max(this.endTime - this.penalty, 0);
                }

                if (this.lives == 0) this.stop();
                this.cardsContainer.classList.remove("replacing");
                this.generateCards();
            }
        });

    render = () =>
        ({
            new: html`
                <button class="start filled" @click=${this.start}>
                    <md-icon>play_arrow</md-icon><span>Start</span>
                </button>
            `,

            running: html`
                <div class="scores">
                    <div class="score">
                        <md-icon>numbers</md-icon>
                        <span>${this.score}</span>
                    </div>
                    <div class="high-score">
                        <md-icon>trophy</md-icon>
                        ${this.currentMember
                            ? html`<span>${this.getHighScore()}</span>`
                            : html`<md-icon spin>sync</md-icon>`}
                    </div>
                </div>
                <div class="cards-container">
                    ${this.cards.map(
                        c => html`
                            <div
                                class="card"
                                data-variation=${c.variation}
                                style="rotate:${c.rotation}deg">
                                ${c.symbols.map(
                                    s => html`
                                        <button
                                            class="transparent"
                                            @click=${() => this.handleChoice(s)}>
                                            <md-icon style="rotate:${s.rotation}deg">
                                                ${s.icon}
                                            </md-icon>
                                        </button>
                                    `
                                )}
                            </div>
                        `
                    )}
                </div>
                <div class="stats" ?data-danger=${this.checkDanger()}>
                    <span>${Math.round(this.timeRemaining / 1000)}</span>
                    <progress value=${this.timeRemaining} max=${this.duration}></progress>
                    <life-counter
                        max-lives=${this.maxLives}
                        lives=${this.lives}
                        ?shake=${this.checkDanger()}></life-counter>
                </div>
                <button class="reset tonal" @click=${this.reset}>
                    <md-icon>restart_alt</md-icon><span>Reset</span>
                </button>
            `,

            finished: html`
                <div class="summary">
                    <life-counter
                        max-lives=${this.maxLives}
                        lives=${this.lives}
                        size="55"></life-counter>
                    <ul>
                        <li class="time">
                            <span class="title">
                                <md-icon>schedule</md-icon><span>Time left</span>
                            </span>
                            <span class="num">${Math.round(this.timeRemaining / 1000)}s</span>
                        </li>
                        <li class="score">
                            <span class="title">
                                <md-icon>numbers</md-icon><span>Score</span>
                            </span>
                            <span class="num">${this.score}</span>
                        </li>
                        <li class="high-score">
                            <span class="title">
                                <md-icon>trophy</md-icon><span>High score</span>
                            </span>
                            <span class="num">
                                ${this.currentMember
                                    ? this.getHighScore()
                                    : html`<md-icon spin>sync</md-icon>`}
                            </span>
                        </li>
                    </ul>
                </div>
                <button class="reset tonal" @click=${this.reset}>
                    <md-icon>arrow_back</md-icon><span>Back</span>
                </button>
            `
        })[this.state];
}
