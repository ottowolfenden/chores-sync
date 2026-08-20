import { Db } from "./db.js";

export class Context {
    private constructor() {}

    static readonly init = async () =>
        await Promise.all([
            this.refreshChores(),
            this.refreshMembers(),
            this.refreshCurrentMember()
        ]);

    private static _chores: UiChore[] | null = null;
    static get chores(): UiChore[] | null {
        return Context._chores;
    }
    static readonly refreshChores = async () => (Context._chores = await Db.getChores());

    private static _members: UiMember[] | null = null;
    static get members(): UiMember[] | null {
        return Context._members;
    }
    static readonly refreshMembers = async () => (Context._members = await Db.getMembers());

    private static _currentMember: UiMember | null = null;
    static get currentMember(): UiMember | null {
        return Context._currentMember;
    }
    static readonly refreshCurrentMember = async () =>
        (Context._currentMember = await Db.getCurrentMember());
}
