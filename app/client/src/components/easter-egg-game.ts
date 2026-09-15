import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getRandFrom, getRandInt, getRandsFrom, shuffle } from "../functions/rand-utils";
import { withTransition } from "../functions/element-utils";
import { updateEasterEggHighScore } from "../functions/db-set";
import { formatOrdinal } from "../functions/num-utils";
import materialSymbols from "../assets/material-symbols.json";
import { Cache } from "../classes/cache";
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
    private startTime = 0;
    private forceEndTime = 0;
    private finishTime = 0;

    @property({ type: String, reflect: true }) state: "new" | "running" | "finished" = "new";
    @property({ type: Array }) members?: UiMember[] | null;
    @property({ type: Object }) currentMember?: UiMember | null;
    @property({ type: Object }) message?: StatusMessage;

    @state() private timeRemaining = this.duration;
    @state() private cards: Card[] = [];
    @state() private score = 0;
    @state() private lives = this.maxLives;

    start = () => {
        if (this.state == "running") return;
        this.generateCards();
        this.state = "running";
        this.startTime = Date.now();
        this.forceEndTime = this.startTime + this.duration;
        this.timer = setInterval(() => {
            this.timeRemaining = Math.max(this.forceEndTime - Date.now(), 0);
            if (this.timeRemaining == 0) this.stop();
        }, 200);
    };

    stop = async () => {
        this.finishTime = Date.now();
        this.state = "finished";
        clearInterval(this.timer);
        this.cards = [];
        if (this.currentMember && this.score > this.currentMember.easterEggHighScore) {
            this.currentMember.easterEggHighScore = this.score;
            await updateEasterEggHighScore(this.currentMember);
            Cache.members.refresh();
            Cache.currentMember.refresh();
        }
    };

    reset = async () => {
        this.stop();
        this.state = "new";
        this.timeRemaining = this.duration;
        this.lives = this.maxLives;
        this.score = this.startTime = this.finishTime = this.forceEndTime = 0;
        if (!this.message) return;
        this.message.status = "loading";
        this.members = await Cache.members.get();
        this.message.status =
            this.members === null ? "error" : this.members.length == 0 ? "empty" : "success";
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

    private handleChoice = (symbol: Symbol) => {
        const container = this.querySelector(".cards-container");
        if (!container) return;
        if (this.checkMatch(symbol)) {
            this.score++;
            this.timeRemaining = Math.min(this.timeRemaining + this.boost, this.duration);
            this.forceEndTime += this.boost;
        } else {
            this.lives--;
            this.timeRemaining = Math.max(this.timeRemaining - this.penalty, 0);
            this.forceEndTime = Math.max(this.forceEndTime - this.penalty, 0);
        }
        if (this.lives == 0) this.stop();

        withTransition(container.querySelector("button"), {
            before: () => container.classList.add("replacing"),
            after: () => {
                container.classList.remove("replacing");
                this.generateCards();
            }
        });
    };

    private checkMatch = (symbol: Symbol) =>
        this.cards.flatMap(c => c.symbols).filter(s => s.icon == symbol.icon).length == 2;

    private checkDanger = () =>
        this.timeRemaining <= 0.2 * this.duration && this.timeRemaining != 0;

    private getHighScore = () =>
        this.currentMember
            ? Math.max(this.currentMember.easterEggHighScore, this.score)
            : null;

    private getLeaderboard = () =>
        this.members
            ?.map(m => ({ name: m.name, score: m.easterEggHighScore }))
            .sort((a, b) => b.score - a.score)
            .reduce<{ name: string; score: number; pos: number }[]>((acc, m) => {
                const prev = acc.at(-1);
                if (prev === undefined) acc.push({ ...m, pos: 1 });
                else acc.push({ ...m, pos: m.score === prev.score ? prev.pos : prev.pos + 1 });
                return acc;
            }, []) ?? [];

    render = () =>
        ({
            new: html`
                <div class="leaderboard">
                    <div><h2>Leaderboard</h2></div>
                    <ol>
                        ${this.getLeaderboard().map(
                            l => html`
                                <li>
                                    <span class="pos">${formatOrdinal(l.pos)}</span>
                                    <span class="name">${l.name}</span>
                                    <span class="score">
                                        <md-icon>trophy</md-icon><span>${l.score}</span>
                                    </span>
                                </li>
                            `
                        )}
                    </ol>
                </div>
                <button class="start filled" @click=${this.start}>
                    <md-icon>play_arrow</md-icon><span>Play</span>
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
                    <span>
                        <md-icon>schedule</md-icon
                        ><span> ${Math.round(this.timeRemaining / 1000)}</span>
                    </span>
                    <progress value=${this.timeRemaining} max=${this.duration}></progress>
                    <life-counter
                        max-lives=${this.maxLives}
                        lives=${this.lives}
                        ?shake=${this.checkDanger()}></life-counter>
                </div>
                <button class="reset tonal" @click=${this.reset}>
                    <md-icon>arrow_back</md-icon><span>Back</span>
                </button>
            `,

            finished: html`
                <div class="summary">
                    <div><h2>Summary</h2></div>
                    <ul>
                        <li class="lives">
                            <span class="title"><md-icon>favorite</md-icon>Lives</span>
                            <span class="value">
                                <life-counter
                                    max-lives=${this.maxLives}
                                    lives=${this.lives}></life-counter>
                            </span>
                        </li>
                        <li class="time">
                            <span class="title">
                                <md-icon>schedule</md-icon><span>Time</span>
                            </span>
                            <span class="value">
                                ${Math.round((this.finishTime - this.startTime) / 1000)}s
                            </span>
                        </li>
                        <li class="score">
                            <span class="title">
                                <md-icon>numbers</md-icon><span>Score</span>
                            </span>
                            <span class="value">${this.score}</span>
                        </li>
                        <li class="high-score">
                            <span class="title">
                                <md-icon>trophy</md-icon><span>High score</span>
                            </span>
                            <span class="value">
                                ${this.currentMember
                                    ? this.getHighScore()
                                    : html`<md-icon spin>sync</md-icon>`}
                            </span>
                        </li>
                    </ul>
                </div>
                <button class="reset tonal" @click=${this.reset}>
                    <md-icon>arrow_forward</md-icon><span>Continue</span>
                </button>
            `
        })[this.state];
}
