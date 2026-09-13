import { LitElement, html } from "lit";
import { customElement, property, state } from "lit/decorators.js";
import { getRandFrom, getRandInt, getRandsFrom, shuffle } from "../functions/rand-utils";
import materialSymbols from "../assets/material-symbols.json";
import type { Conf } from "./state-actions";

export type Symbol = { icon: string; rotation: number };
export type Card = { symbols: Symbol[]; variation: number; rotation: number };

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    private readonly numPerCard = 8;
    private readonly gameDuration = 40_000;
    private readonly emptyCards: Card[] = [
        { symbols: [], variation: 0, rotation: 0 },
        { symbols: [], variation: 0, rotation: 0 }
    ];
    private timer?: number;

    @property({ type: Boolean }) running: boolean = false;
    @state() timeRemaining = this.gameDuration;
    @state() private cards: Card[] = this.emptyCards;

    private start = () => {
        if (this.running) return;
        this.generateCards();
        this.running = true;
        const endTime = Date.now() + this.gameDuration;
        this.timer = setInterval(() => {
            this.timeRemaining = Math.max(endTime - Date.now(), 0);
            if (this.timeRemaining == 0) this.resetTimer();
        }, 200);
    };

    private reset = () => {
        this.running = false;
        this.resetTimer();
        this.cards = this.emptyCards;
    };

    private resetTimer = () => {
        clearInterval(this.timer);
        this.timeRemaining = this.gameDuration;
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
            variation: 1,
            rotation: getRandInt(0, 360)
        }));
    };

    render = () => html`
        <div class="cards-container">
            ${this.cards.map(
                c => html`
                    <div class="card" data-variation=${c.variation}>
                        ${c.symbols.map(
                            s => html`
                                <button class="transparent">
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
        <progress value=${this.timeRemaining} max=${this.gameDuration}></progress>
        <state-actions
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
