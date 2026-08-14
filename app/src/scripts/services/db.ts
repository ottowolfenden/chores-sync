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
}
