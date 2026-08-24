import { getMembers } from "../services/members";

const autoAssign = async (env: Env) => {
    const result = await getMembers(env);
    const data = result.ok ? result.data : null;
    console.log(data);
};

export default {
    scheduled: async (
        _: ScheduledEvent,
        env: Env,
        execContext: ExecutionContext
    ): Promise<void> => execContext.waitUntil(autoAssign(env))
};
