import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getRandFrom, getRandInt, getRandsFrom, shuffle } from "../functions/rand-utils";
import materialSymbols from "../assets/material-symbols.json";

export type Symbol = { icon: string; rotation: number };
export type Card = { symbols: Symbol[]; variation: number; rotation: number };

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    private readonly numPerCard = 8;
    @state() private cards?: Card[];

    connectedCallback() {
        super.connectedCallback();
        this.generateCards();
    }

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
            variation: getRandInt(1, 10),
            rotation: getRandInt(0, 360)
        }));
    };

    render = () =>
        this.cards?.map(
            c => html`
                <div
                    class="card"
                    data-variation=${c.variation}
                    style="rotate:${c.rotation}deg">
                    ${c.symbols.map(
                        s => html`<md-icon style="rotate:${s.rotation}deg">${s.icon}</md-icon>`
                    )}
                </div>
            `
        );
}
