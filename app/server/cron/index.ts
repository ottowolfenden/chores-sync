import { getAllChores } from "../services/chores";
import { getTurns } from "../services/turns";
import { replaceAssignments } from "../services/assignments";

const autoAssign = async (env: Env) => {
    const turnsResult = await getTurns(env);
    const choresResult = await getAllChores(env);
    const turns = turnsResult.ok ? turnsResult.data : null;
    const chores = choresResult.ok ? choresResult.data : null;

    if (!turns || !chores || !chores.every(c => turns.some(t => t.chore_id == c.chore_id)))
        return;

    const today = new Date().toISOString().split("T")[0];
    const assignments: DbAssignment[] = chores
        .filter(c => c.is_daily)
        .map(c => ({
            assignment_uuid: crypto.randomUUID(),
            assign_date: new Date(),
            quantity: 1,
            is_offset: false,
            chore_id: c.chore_id,
            member_id: turns.find(t => t.chore_id == c.chore_id)!.member_id
        }));

    await replaceAssignments(env, assignments, today);
};

export default {
    scheduled: async (
        _: ScheduledEvent,
        env: Env,
        execContext: ExecutionContext
    ): Promise<void> => execContext.waitUntil(autoAssign(env))
};
