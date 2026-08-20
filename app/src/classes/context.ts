import { getChores, getMembers, getCurrentMember } from "../functions/db.js";

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
    static readonly refreshChores = async () => (Context._chores = await getChores());

    private static _members: UiMember[] | null = null;
    static get members(): UiMember[] | null {
        return Context._members;
    }
    static readonly refreshMembers = async () => (Context._members = await getMembers());

    private static _currentMember: UiMember | null = null;
    static get currentMember(): UiMember | null {
        return Context._currentMember;
    }
    static readonly refreshCurrentMember = async () =>
        (Context._currentMember = await getCurrentMember());
}
