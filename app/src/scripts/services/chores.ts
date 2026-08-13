const getChores = async (): Promise<UiChore[] | null> => {
    const guess = localStorage.getItem("login-secret");
    if (!guess) return null;
    const response = await fetch("/api/get-chores", { headers: { "X-Login-Secret": guess } });
    if (!response.ok) return null;

    // TEMP
    await new Promise(r => setTimeout(r, 3000));

    const data: DbChore[] = await response.json();
    return data.map(
        (d): UiChore => ({
            id: d["chore_id"],
            name: d["chore_name"],
            daily: d["daily"]
        })
    );
};

export { getChores };
