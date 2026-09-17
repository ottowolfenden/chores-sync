export class UiCount {
    choreName: string;
    memberCounts: { memberName: string; total: number; offset: number }[];

    constructor(uiCount: {
        choreName: string;
        memberCounts: { memberName: string; total: number; offset: number }[];
    }) {
        this.choreName = uiCount.choreName;
        this.memberCounts = uiCount.memberCounts;
    }

    clone = () =>
        new UiCount({
            choreName: this.choreName,
            memberCounts: structuredClone(this.memberCounts)
        });
}
