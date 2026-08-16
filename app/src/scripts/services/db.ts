export class Db {
    private constructor() {}

    static getChores = async (): Promise<UiChore[] | null> => {
        const guess = localStorage.getItem("secret");
        if (!guess) return null;
        const response = await fetch("/api/get-chores", {
            headers: { "Authorization": guess }
        });
        if (!response.ok) return null;

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

    static getCounts = async (): Promise<UiCount[] | null> => {
        const guess = localStorage.getItem("secret");
        if (!guess) return null;
        const response = await fetch("/api/get-counts", {
            headers: { "Authorization": guess }
        });
        if (!response.ok) return null;

        const data: DbCount[] = await response.json();
        const choreNames = [...new Set(data.map(d => d["chore_name"]))];
        const memberNames = [...new Set(data.map(d => d["member_name"]))];
        return choreNames.map(cn => ({
            choreName: cn,
            memberCounts: memberNames.map(mn => {
                const records = data.filter(
                    d => d["member_name"] == mn && d["chore_name"] == cn
                );
                const offsetCount = records?.find(r => r["is_offset"])?.total ?? 0;
                const nonOffsetCount = records?.find(r => !r["is_offset"])?.total ?? 0;
                return {
                    memberName: mn,
                    total: offsetCount + nonOffsetCount,
                    offset: offsetCount
                };
            })
        }));
    };
}
