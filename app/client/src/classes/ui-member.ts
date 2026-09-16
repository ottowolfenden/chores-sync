export class UiMember {
    private readonly _id: number;
    private readonly _name: string;
    private readonly _dateOfBirth: Date | null;
    isAdmin: boolean;
    inactivePeriods: string;
    highScore: number;

    constructor(uiMember: {
        id: number;
        name: string;
        dateOfBirth: Date | null;
        isAdmin: boolean;
        inactivePeriods: string;
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

    toDbMember = (): DbMember => ({
        "member_id": this.id,
        "member_name": this.name,
        "is_admin": this.isAdmin,
        "inactive_periods": this.inactivePeriods,
        "date_of_birth": this.dateOfBirth,
        "easter_egg_high_score": this.highScore
    });
}
