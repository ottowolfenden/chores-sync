import { Db } from "./db.js";

export class Context {
    private constructor() {}

    private static choresCache: Promise<UiChore[] | null> | null = null;
    static get chores(): Promise<UiChore[] | null> {
        Context.choresCache ??= Db.getChores();
        return Context.choresCache;
    }

    private static membersCache: Promise<UiMember[] | null> | null = null;
    static get members(): Promise<UiMember[] | null> {
        Context.membersCache ??= Db.getMembers();
        return Context.membersCache;
    }

    private static currentMemberCache: Promise<UiMember | null> | null = null;
    static get currentMember(): Promise<UiMember | null> {
        Context.currentMemberCache ??= Db.getCurrentMember();
        return Context.currentMemberCache;
    }
}
