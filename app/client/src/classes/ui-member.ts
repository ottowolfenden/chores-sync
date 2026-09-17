import {
    getDateOnlyVal,
    getDateString,
    offsetDate,
    toDateMultiRange
} from "../functions/date-utils";

export class UiMember {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _dateOfBirth: Date | null;
    private inactivePeriods: { first: number; last: number }[];
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

    clone = () =>
        new UiMember({
            id: this.id,
            name: this.name,
            dateOfBirth: this.dateOfBirth,
            isAdmin: this.isAdmin,
            inactivePeriods: structuredClone(this.inactivePeriods),
            highScore: this.highScore
        });

    toDbMember = (): DbMember => ({
        "member_id": this.id,
        "member_name": this.name,
        "is_admin": this.isAdmin,
        "inactive_periods": toDateMultiRange(this.inactivePeriods),
        "date_of_birth": this.dateOfBirth,
        "easter_egg_high_score": this.highScore
    });

    checkActive = (date: Date | string = getDateString()) =>
        !this.inactivePeriods.some(
            p => p.first <= getDateOnlyVal(date) && p.last >= getDateOnlyVal(date)
        );

    setActive = (active: boolean) => {
        const today = getDateOnlyVal();
        const yesterday = getDateOnlyVal(offsetDate(new Date(), -1));
        if (active)
            this.inactivePeriods = this.inactivePeriods
                .filter(p => p.first < today)
                .map(p =>
                    p.first <= today && p.last >= today ? { ...p, last: yesterday } : p
                );
        else if (!active && this.checkActive())
            this.inactivePeriods.push({ first: today, last: Infinity });
    };
}
