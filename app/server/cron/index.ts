import { getAllChores } from "../services/chores";
import { getTurns } from "../services/turns";
import { getAssignments, replaceAssignments } from "../services/assignments";
import { getDateToday } from "../utils";
import { changeCounts, getAllCounts } from "../services/counts";
import { getMembersWithIsActive } from "../services/members";

const autoAssign = async (env: Env) => {
    const turnsResult = await getTurns(env, getDateToday());
    const choresResult = await getAllChores(env);
    const turns = turnsResult.ok ? turnsResult.data : null;
    const chores = choresResult.ok ? choresResult.data : null;

    if (
        !turns ||
        !chores ||
        !chores.every(c => turns.some(t => t["chore_id"] === c["chore_id"]))
    )
        return;

    const result = await getAssignments(env, { date: getDateToday() });
    const existingAssignments = result.ok ? result.data : null;
    if (!existingAssignments) return;

    const assignments: DbAssignment[] = chores
        .filter(c => c["is_daily"])
        .map(c => ({
            "assignment_uuid": crypto.randomUUID(),
            "assign_date": new Date(),
            "quantity": 1,
            "is_offset": false,
            "chore_id": c["chore_id"],
            "member_id": turns.find(t => t["chore_id"] === c["chore_id"])!["member_id"]
        }))
        .filter(a => !existingAssignments.some(ea => ea["chore_id"] === a["chore_id"]))
        .concat(existingAssignments);

    await replaceAssignments(env, assignments, getDateToday());
};

const offsetInactive = async (env: Env) => {
    const membersResult = await getMembersWithIsActive(env);
    const countsResult = await getAllCounts(env);
    const members = membersResult.ok ? membersResult.data : null;
    const counts = countsResult.ok
        ? countsResult.data?.map(c => ({ ...c, "total": Number(c["total"]) }))
        : null;
    if (!counts || !members) return;

    const activeMembers = members.filter(m => m["is_active"]);
    const inactiveMembers = members.filter(m => !m["is_active"]);
    if (activeMembers.length === 0 || inactiveMembers.length === 0) return;

    const inactiveNames = inactiveMembers.map(im => im["member_name"]);
    const choreNames = [...new Set(counts.map(c => c["chore_name"]))];

    const getSummedCounts = ({ choreName, active }: { choreName: string; active: boolean }) =>
        counts
            .filter(
                c =>
                    c["chore_name"] === choreName &&
                    !inactiveNames.includes(c["member_name"]) === active
            )
            .reduce(
                (acc, count) => {
                    const existing = acc.find(
                        c =>
                            c["chore_name"] === count["chore_name"] &&
                            c["member_name"] === count["member_name"]
                    );
                    if (existing) existing.total += count.total;
                    else
                        acc.push({
                            "chore_name": count["chore_name"],
                            "member_name": count["member_name"],
                            "total": count["total"]
                        });
                    return acc;
                },
                [] as Omit<DbCount, "is_offset">[]
            );

    const inactiveOffsets: DbCount[] = choreNames.flatMap(choreName => {
        const minCount = Math.min(
            ...getSummedCounts({ choreName, active: true }).map(c => c["total"])
        );
        return getSummedCounts({ choreName, active: false })
            .map(ic => ({
                "member_name": ic["member_name"],
                "chore_name": choreName,
                "is_offset": true,
                "total": minCount - ic["total"]
            }))
            .filter(ic => ic["total"] > 0);
    });

    let newCounts = counts
        .filter(c => c["is_offset"])
        .map(c => {
            const inactiveOffset = inactiveOffsets.find(
                io =>
                    io["chore_name"] == c["chore_name"] &&
                    io["member_name"] == c["member_name"]
            );
            return inactiveOffset
                ? { ...c, "total": c["total"] + inactiveOffset["total"] }
                : c;
        })
        .filter(c => c["total"] != 0)
        .concat();

    newCounts = [
        ...newCounts,
        ...inactiveOffsets.filter(
            io =>
                !newCounts.some(
                    nc =>
                        nc["chore_name"] == io["chore_name"] &&
                        nc["member_name"] == io["member_name"]
                )
        )
    ];

    await changeCounts(env, newCounts);
};

export default {
    scheduled: async (_: ScheduledEvent, env: Env, execCtx: ExecutionContext) =>
        execCtx.waitUntil(
            (async () => {
                await autoAssign(env);
                await offsetInactive(env);
            })()
        )
};
