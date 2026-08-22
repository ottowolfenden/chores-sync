import { Context } from "../classes/context.js";

const timeout = 10000;

export const getChores = async (): Promise<UiChore[] | null> => {
    const guess = localStorage.getItem("secret");
    if (!guess) return null;
    const response = await fetch("/api/chores", {
        method: "GET",
        headers: { "Authorization": guess },
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);
    if (!response?.ok) return null;

    const data: DbChore[] = await response.json();
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
    const guess = localStorage.getItem("secret");
    if (!guess) return null;
    const response = await fetch("/api/counts", {
        method: "GET",
        headers: { "Authorization": guess },
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);
    if (!response?.ok) return null;

    const data: DbCount[] = await response.json();
    const choreNames = [...new Set(data.map(d => d["chore_name"]))];
    const memberNames = [...new Set(data.map(d => d["member_name"]))];
    return choreNames.map(cn => ({
        choreName: cn,
        memberCounts: memberNames.map(mn => {
            const records = data.filter(d => d["member_name"] == mn && d["chore_name"] == cn);
            const offsetCount = Number(records?.find(r => r["is_offset"])?.total ?? 0);
            const nonOffsetCount = Number(records?.find(r => !r["is_offset"])?.total ?? 0);
            return {
                memberName: mn,
                total: offsetCount + nonOffsetCount,
                offset: offsetCount
            };
        })
    }));
};

export const setCount = async (uiCount: UiCount): Promise<boolean> => {
    const guess = localStorage.getItem("secret");
    if (!guess) return false;

    const response = await fetch("/api/counts", {
        method: "POST",
        body: JSON.stringify(
            uiCount.memberCounts.map(mc => ({
                "chore_name": uiCount.choreName,
                "is_offset": true,
                "member_name": mc.memberName,
                "total": mc.offset
            }))
        ),
        headers: { "Authorization": guess },
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);

    return response?.ok ?? false;
};

export const getMembers = async (): Promise<UiMember[] | null> => {
    const guess = localStorage.getItem("secret");
    if (!guess) return null;
    const response = await fetch("/api/members", {
        method: "GET",
        headers: { "Authorization": guess },
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);
    if (!response?.ok) return null;

    const data: DbMember[] = await response.json();
    return data.map(
        (d): UiMember => ({
            id: d["member_id"],
            name: d["member_name"],
            isActive: d["is_active"],
            isAdmin: d["is_admin"]
        })
    );
};

export const getCurrentMember = async (): Promise<UiMember | null> => {
    const guess = localStorage.getItem("secret");
    const name = localStorage.getItem("name");
    if (!guess || !name) return null;
    const response = await fetch(`/api/members?name=${encodeURIComponent(name)}`, {
        method: "GET",
        headers: { "Authorization": guess },
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);
    if (!response?.ok) return null;

    const data: DbMember = await response.json();
    return {
        id: data["member_id"],
        name: data["member_name"],
        isActive: data["is_active"],
        isAdmin: data["is_admin"]
    };
};

export const getTodayAssignments = async (): Promise<UiAssignment[] | null> => {
    const guess = localStorage.getItem("secret");
    if (!guess) return null;
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`/api/assignments?date=${today}`, {
        method: "GET",
        headers: { "Authorization": guess },
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);
    if (!response?.ok) return null;

    const data: DbAssignment[] = await response.json();
    const chores = await Context.chores;
    const members = await Context.members;
    const turns = await Context.turns;

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
            id: d["assignment_id"],
            date: d["assign_date"],
            quantity: d["quantity"],
            chore: chores.find(c => c.id == d["chore_id"])!,
            turnMember: turns.find(t => t.chore.id == d["chore_id"])!.member,
            chosenMember: members.find(m => m.id == d["member_id"])!
        })
    );
};

export const getTurns = async (): Promise<UiTurn[] | null> => {
    const guess = localStorage.getItem("secret");
    if (!guess) return null;
    const response = await fetch("/api/turns", {
        method: "GET",
        headers: { "Authorization": guess },
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);
    if (!response?.ok) return null;

    const data: DbTurn[] = await response.json();
    const chores = await Context.chores;
    const members = await Context.members;

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
