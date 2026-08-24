import { neon } from "@neondatabase/serverless";

const autoAssign = async (env: Env) => {
    try {
        const sql = neon(env.DATABASE_URL);
        console.log(await sql`SELECT chore_name FROM chores;`);
    } catch (err) {
        console.error("auto assign failed", err);
    }
};

export default {
    scheduled: async (
        event: ScheduledEvent,
        env: Env,
        execContext: ExecutionContext
    ): Promise<void> => execContext.waitUntil(autoAssign(env))
};
