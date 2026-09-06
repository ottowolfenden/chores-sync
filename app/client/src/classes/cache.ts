import * as Db from "../functions/db-get.js";

const createCache = <T>(dbFunc: () => Promise<T>) => {
    let cachePromise: Promise<T> | null = null;
    return {
        get: async (): Promise<T> => (cachePromise ??= dbFunc()),
        invalidate: () => (cachePromise = null),
        refresh: async (): Promise<T> => {
            cachePromise = null;
            return (cachePromise = dbFunc());
        }
    };
};

export class Cache {
    private constructor() {}

    static readonly chores = createCache(Db.getChores);
    static readonly members = createCache(Db.getMembers);
    static readonly currentMember = createCache(Db.getCurrentMember);
    static readonly turns = createCache(Db.getTurns);
    static readonly todayAssignments = createCache(Db.getTodayAssignments);
    static readonly counts = createCache(Db.getCounts);

    static readonly caches = [
        Cache.chores,
        Cache.members,
        Cache.currentMember,
        Cache.turns,
        Cache.todayAssignments,
        Cache.counts
    ];
}
