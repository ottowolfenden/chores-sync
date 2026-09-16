import type { UiChore } from "./ui-chore";
import type { UiMember } from "./ui-member";

export class UiTurn {
    chore: UiChore;
    member: UiMember;

    constructor(uiTurn: { chore: UiChore; member: UiMember }) {
        this.chore = uiTurn.chore;
        this.member = uiTurn.member;
    }
}
