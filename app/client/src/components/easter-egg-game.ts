import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getRandFrom, getRandsFrom, shuffle } from "../functions/rand-utils";
import materialSymbols from "../assets/material-symbols.json";

export type Symbol = { icon: string; rotation: number; size: number };
export type Card = { variation: number; symbols: Symbol[] };

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    private readonly numPerCard = 8;

    @state() private cards?: [Card, Card];

    connectedCallback() {
        super.connectedCallback();
        this.generateCards();
    }

    private generateCards = () => {
        let symbols = [
            ...new Set(materialSymbols.find(obj => obj.for == "easter-egg")?.icons)
        ];
        if (!symbols) return;
        const match = getRandFrom(symbols);
        symbols = symbols.filter(s => s != match);
        const symbols1 = getRandsFrom(symbols, this.numPerCard - 1);
        symbols = symbols.filter(s => !symbols1.some(s1 => s1 == s));
        const symbols2 = getRandsFrom(symbols, this.numPerCard - 1);

        this.cards = [
            {
                variation: 1,
                symbols: shuffle([match, ...symbols1]).map(icon => ({
                    icon,
                    rotation: 0,
                    size: 0
                }))
            },
            {
                variation: 1,
                symbols: shuffle([match, ...symbols2]).map(icon => ({
                    icon,
                    rotation: 0,
                    size: 0
                }))
            }
        ];
    };

    render = () =>
        this.cards?.map(
            c => html`
                <div class="card">
                    ${c.symbols.map(s => html`<md-icon>${s.icon}</md-icon>`)}
                </div>
            `
        );
}
