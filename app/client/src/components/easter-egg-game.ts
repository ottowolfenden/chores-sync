import { LitElement, html } from "lit";
import { customElement, property, query, state } from "lit/decorators.js";
import { getRandFrom, getRandInt, getRandsFrom, shuffle } from "../functions/rand-utils";
import type { Conf } from "./state-actions";
import { withTransition } from "../functions/element-utils";
import { updateEasterEggHighScore } from "../functions/db-set";
import materialSymbols from "../assets/material-symbols.json";

export type Symbol = { icon: string; rotation: number };
export type Card = { symbols: Symbol[]; variation: 1 | 2 | 3 | 4 | 5; rotation: number };

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    private readonly numPerCard = 8;
    private readonly duration = 60_000;
    private readonly maxLives = 3;
    private readonly penalty = 3000;
    private readonly boost = 2000;
    private readonly emptyCards: Card[] = [
        { symbols: [], variation: 1, rotation: 0 },
        { symbols: [], variation: 1, rotation: 0 }
    ];

    @property({ type: Boolean }) running = false;
    @property({ type: Object }) currentMember?: UiMember | null;
    @state() private timeRemaining = this.duration;
    @state() private cards: Card[] = this.emptyCards;
    @state() private score = 0;
    @state() private lives = this.maxLives;
    @query(".cards-container") private cardsContainer!: HTMLDivElement;

    private timer?: number;
    private endTime: number = Infinity;
    private get dangerZone() {
        return this.timeRemaining <= 0.2 * this.duration && this.timeRemaining != 0;
    }

    start = () => {
        if (this.running) return;
        this.generateCards();
        this.running = true;
        this.endTime = Date.now() + this.duration;
        this.timer = setInterval(() => {
            this.timeRemaining = Math.max(this.endTime - Date.now(), 0);
            if (this.timeRemaining == 0) this.stop();
        }, 200);
    };

    stop = () => {
        clearInterval(this.timer);
        withTransition(this.cardsContainer.querySelector("button"), {
            before: () => this.cardsContainer.classList.add("resetting"),
            after: () => {
                this.cards = this.emptyCards;
                this.cardsContainer.classList.remove("resetting");
            }
        });
        if (this.currentMember && this.score > this.currentMember.easterEggHighScore) {
            this.currentMember.easterEggHighScore = this.score;
            updateEasterEggHighScore(this.currentMember);
        }
    };

    reset = () => {
        this.running = false;
        this.stop();
        this.timeRemaining = this.duration;
        this.lives = this.maxLives;
        this.score = 0;
    };

    private handleChoice = (symbol: Symbol) => {
        if (
            this.cards.flatMap(c => c.symbols).filter(s => s.icon == symbol.icon).length == 2
        ) {
            this.score++;
            this.timeRemaining = Math.min(this.timeRemaining + this.boost, this.duration);
            this.endTime += this.boost;
        } else {
            this.lives--;
            this.timeRemaining = Math.max(this.timeRemaining - this.penalty, 0);
            this.endTime = Math.max(this.endTime - this.penalty, 0);
        }

        if (this.lives == 0) this.stop();
        this.generateCards();
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

    render = () => html`
        <div class="scores">
            <div class="score" ?hidden=${!this.running}>
                <md-icon>numbers</md-icon>
                <span>${this.score}</span>
            </div>
            <div class="high-score">
                <md-icon>trophy</md-icon>
                ${this.currentMember
                    ? html`<span>
                          ${Math.max(this.currentMember.easterEggHighScore, this.score)}
                      </span>`
                    : html`<md-icon class="spin">sync</md-icon>`}
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
        <div class="stats ${this.dangerZone ? "danger" : ""}">
            <span>${Math.round(this.timeRemaining / 1000)}</span>
            <progress value=${this.timeRemaining} max=${this.duration}></progress>
            <div class="lives">
                ${Array.from(
                    { length: this.lives },
                    () => html`
                        <md-icon class="life ${this.dangerZone ? "shake" : ""}">
                            favorite
                        </md-icon>
                    `
                )}
                ${Array.from(
                    { length: this.maxLives - this.lives },
                    () => html`<md-icon class="lost-life">heart_broken</md-icon>`
                )}
            </div>
        </div>
        <state-actions
            state=${this.running ? "active" : "normal"}
            .conf=${{
                normal: {
                    icon: "play_arrow",
                    label: "Start",
                    class: "filled",
                    click: this.start
                },
                active: {
                    icon: "restart_alt",
                    label: "Reset",
                    class: "tonal",
                    withTransition: false,
                    click: this.reset
                }
            } as Conf}>
        </state-actions>
    `;
}
