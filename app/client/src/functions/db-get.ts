import { Cache } from "../classes/cache";
import { request } from "./api-utils";

export const getChores = async (): Promise<UiChore[] | null> => {
    const { ok, data } = await request<DbChore[]>("GET", "/api/chores");
    if (!ok || !data) return null;
    return data.map(
        (d): UiChore => ({
            id: d["chore_id"],
            name: d["chore_name"],
            isDaily: d["is_daily"],
            limitPerDay: d["limit_per_day"]
        })
    );
};

export const getCounts = async (): Promise<UiCount[] | null> => {
    const { ok, data } = await request<DbCount[]>("GET", "/api/counts");
    if (!ok || !data) return null;
    const choreNames = [...new Set(data.map(d => d["chore_name"]))];
    const memberNames = [...new Set(data.map(d => d["member_name"]))];
    return choreNames.map(cn => ({
        choreName: cn,
        memberCounts: memberNames.map(mn => {
            const records = data.filter(d => d["member_name"] == mn && d["chore_name"] == cn);
            const offsetCount = Number(records.find(r => r["is_offset"])?.total ?? 0);
            const nonOffsetCount = Number(records.find(r => !r["is_offset"])?.total ?? 0);
            return {
                memberName: mn,
                total: offsetCount + nonOffsetCount,
                offset: offsetCount
            };
        })
    }));
};

export const getMembers = async (): Promise<UiMember[] | null> => {
    const { ok, data } = await request<DbMember[]>("GET", "/api/members");
    if (!ok || !data) return null;
    return data.map(
        (d): UiMember => ({
            id: d["member_id"],
            name: d["member_name"],
            isActive: d["is_active"],
            isAdmin: d["is_admin"]
        })
    );
};

export const getCurrentMember = async (): Promise<UiMember | null> =>
    (await Cache.members.get())?.find(m => m.name == localStorage.getItem("name")) ?? null;

export const getTodayAssignments = async (): Promise<UiAssignment[] | null> => {
    const today = new Date().toISOString().split("T")[0];
    const { ok, data } = await request<DbAssignment[]>(
        "GET",
        `/api/assignments?date=${today}`
    );
    if (!ok || !data) return null;

    const chores = await Cache.chores.get();
    const members = await Cache.members.get();
    const turns = await Cache.turns.get();

    if (
        !chores ||
        !members ||
        !turns ||
        !data.every(
            d =>
                chores.some(c => c.id == d["chore_id"]) &&
                members.some(m => m.id == d["member_id"]) &&
                turns.some(t => t.chore.id == d["chore_id"])
        )
    )
        return null;

    return data.map(
        (d): UiAssignment => ({
            uuid: d["assignment_uuid"],
            date: d["assign_date"],
            quantity: d["quantity"],
            chore: chores.find(c => c.id == d["chore_id"])!,
            turnMember: turns.find(t => t.chore.id == d["chore_id"])!.member,
            chosenMember: members.find(m => m.id == d["member_id"])!
        })
    );
};

export const getTurns = async (): Promise<UiTurn[] | null> => {
    const { ok, data } = await request<DbTurn[]>("GET", "/api/turns");
    if (!ok || !data) return null;
    const chores = await Cache.chores.get();
    const members = await Cache.members.get();

    if (
        !chores ||
        !members ||
        !data.every(
            d =>
                chores.some(c => c.id == d["chore_id"]) &&
                members.some(m => m.id == d["member_id"])
        )
    )
        return null;

    return data.map(
        (d): UiTurn => ({
            chore: chores.find(c => c.id == d["chore_id"])!,
            member: members.find(m => m.id == d["member_id"])!
        })
    );
};
