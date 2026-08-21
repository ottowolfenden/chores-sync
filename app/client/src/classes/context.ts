import { getChores, getMembers, getCurrentMember } from "../functions/db.js";

export class Context {
    private constructor() {}

    private static choresCache: Promise<UiChore[] | null> | null = null;
    static get chores(): Promise<UiChore[] | null> {
        Context.choresCache ??= getChores();
        return Context.choresCache;
    }
    static updateChores = () => (Context.choresCache = getChores());

    private static membersCache: Promise<UiMember[] | null> | null = null;
    static get members(): Promise<UiMember[] | null> {
        Context.membersCache ??= getMembers();
        return Context.membersCache;
    }
    static updateMembers = () => (Context.membersCache = getMembers());

    private static currentMemberCache: Promise<UiMember | null> | null = null;
    static get currentMember(): Promise<UiMember | null> {
        Context.currentMemberCache ??= getCurrentMember();
        return Context.currentMemberCache;
    }
    static updateCurrentMember = () => (Context.currentMemberCache = getCurrentMember());
}
