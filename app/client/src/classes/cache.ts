import * as Db from "../functions/db-get.js";

export type CacheData<T = unknown> = {
    get: () => Promise<T>;
    getExists: () => boolean;
    invalidate: () => null;
    refresh: () => Promise<T>;
};

const createCache = <T>(dbFunc: () => Promise<T>): CacheData<T> => {
    let cachePromise: Promise<T> | null = null;
    return {
        get: async (): Promise<T> => (cachePromise ??= dbFunc()),
        getExists: () => cachePromise != null,
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

    static readonly caches: CacheData[] = [
        Cache.chores,
        Cache.members,
        Cache.currentMember,
        Cache.turns,
        Cache.todayAssignments,
        Cache.counts
    ];
}
