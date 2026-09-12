import { LitElement, html } from "lit";
import { customElement, state } from "lit/decorators.js";
import { getRandFrom, getRandsFrom, shuffle } from "../functions/rand-utils";
import materialSymbols from "../assets/material-symbols.json";

@customElement("easter-egg-game")
export class EasterEggGame extends LitElement {
    protected createRenderRoot = () => this;

    private readonly numPerCard = 8;

    @state() private cards?: string[][];

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
            [match, ...symbols1],
            [match, ...symbols2]
        ].map(shuffle);
    };

    render = () =>
        this.cards?.map(
            c => html`<div class="card">${c.map(i => html`<md-icon>${i}</md-icon>`)}</div>`
        );
}
