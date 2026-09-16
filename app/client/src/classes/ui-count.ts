export class UiCount {
    private readonly _choreName: string;
    memberCounts: { memberName: string; total: number; offset: number }[];

    constructor(uiCount: {
        choreName: string;
        memberCounts: { memberName: string; total: number; offset: number }[];
    }) {
        this._choreName = uiCount.choreName;
        this.memberCounts = uiCount.memberCounts;
    }

    get choreName() {
        return this._choreName;
    }

    clone = () =>
        new UiCount({
            choreName: this.choreName,
            memberCounts: structuredClone(this.memberCounts)
        });
}
