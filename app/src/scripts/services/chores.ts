const getChores = async (): Promise<UiChore[]> => {
    const guess = localStorage.getItem("login-secret");
    if (!guess) return [];
    const response = await fetch("/api/get-chores", { headers: { "X-Login-Secret": guess } });
    if (!response.ok) return [];
    const data: DbChore[] = await response.json();
    return data.map(
        (d): UiChore => ({
            id: d["chore_id"],
            name: d["chore_name"],
            daily: d["daily"],
            maxOnePerDay: d["max_one_per_day"]
        })
    );
};

export { getChores };
