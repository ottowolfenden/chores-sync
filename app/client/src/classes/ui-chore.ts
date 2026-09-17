export class UiChore {
    id: number;
    name: string;
    isDaily: boolean;
    limitPerDay: number | null;

    constructor(uiChore: {
        id: number;
        name: string;
        isDaily: boolean;
        limitPerDay: number | null;
    }) {
        this.id = uiChore.id;
        this.name = uiChore.name;
        this.isDaily = uiChore.isDaily;
        this.limitPerDay = uiChore.limitPerDay;
    }
}
