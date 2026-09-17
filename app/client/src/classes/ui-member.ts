import { getDateOnlyVal, getDateString } from "../functions/date-utils";

export class UiMember {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _dateOfBirth: Date | null;
    inactivePeriods: { first: number; last: number }[];
    isAdmin: boolean;
    highScore: number;

    constructor(uiMember: {
        id: number;
        name: string;
        dateOfBirth: Date | null;
        isAdmin: boolean;
        inactivePeriods: { first: number; last: number }[];
        highScore: number;
    }) {
        this._id = uiMember.id;
        this._name = uiMember.name;
        this._dateOfBirth = uiMember.dateOfBirth;
        this.isAdmin = uiMember.isAdmin;
        this.inactivePeriods = uiMember.inactivePeriods;
        this.highScore = uiMember.highScore;
    }

    get id() {
        return this._id;
    }

    get name() {
        return this._name;
    }

    get dateOfBirth() {
        return this._dateOfBirth;
    }

    get isActiveToday() {
        return this.checkActive();
    }

    set isActiveToday(value: boolean) {
        (value ? this.makeActive : this.makeInactive)();
    }

    toDbMember = (): DbMember => ({
        "member_id": this.id,
        "member_name": this.name,
        "is_admin": this.isAdmin,
        "inactive_periods": "CONVERT this.inactivePeriods HERE",
        "date_of_birth": this.dateOfBirth,
        "easter_egg_high_score": this.highScore
    });

    checkActive = (date: Date | string = getDateString()) =>
        !this.inactivePeriods.some(
            p => p.first <= getDateOnlyVal(date) && p.last >= getDateOnlyVal(date)
        );

    private makeActive = (date: Date | string = getDateString()) => {};

    private makeInactive = (date: Date | string = getDateString()) => {};
}
