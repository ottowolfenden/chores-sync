export class UiChore {
    private readonly _id: number;
    private readonly _name: string;
    isDaily: boolean;
    limitPerDay: number | null;

    constructor(uiChore: {
        id: number;
        name: string;
        isDaily: boolean;
        limitPerDay: number | null;
    }) {
        this._id = uiChore.id;
        this._name = uiChore.name;
        this.isDaily = uiChore.isDaily;
        this.limitPerDay = uiChore.limitPerDay;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }
}
