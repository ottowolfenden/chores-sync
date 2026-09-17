import { getDateString } from "../functions/date-utils";
import type { UiChore } from "./ui-chore";
import type { UiMember } from "./ui-member";

export class UiAssignment {
    uuid: string;
    date: Date;
    quantity: number;
    chore: UiChore;
    turnMember: UiMember;
    chosenMember: UiMember;

    constructor(uiAssignment: {
        uuid: string;
        date: Date;
        quantity: number;
        chore: UiChore;
        turnMember: UiMember;
        chosenMember: UiMember;
    }) {
        this.uuid = uiAssignment.uuid;
        this.date = uiAssignment.date;
        this.quantity = uiAssignment.quantity;
        this.chore = uiAssignment.chore;
        this.turnMember = uiAssignment.turnMember;
        this.chosenMember = uiAssignment.chosenMember;
    }

    toDbAssignment = (): DbAssignment => ({
        "assignment_uuid": this.uuid,
        "assign_date": this.date,
        "quantity": this.quantity,
        "is_offset": false,
        "chore_id": this.chore.id,
        "member_id": this.chosenMember.id
    });

    static cloneAndSum = (assignments: UiAssignment[] | null | undefined): UiAssignment[] => {
        if (!assignments) return [];
        const map = new Map<string, UiAssignment>();
        assignments.forEach(a => {
            const key = `${a.chosenMember.id}-${a.chore.id}-${getDateString()}`;
            if (map.has(key)) map.get(key)!.quantity += a.quantity;
            else map.set(key, new UiAssignment(a));
        });
        return [...map.values()];
    };
}
