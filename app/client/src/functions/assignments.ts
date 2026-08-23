export const cloneAndSum = (assignments: UiAssignment[]): UiAssignment[] => {
    const map = new Map<string, UiAssignment>();
    assignments.forEach(a => {
        const today = new Date(a.date).toISOString().split("T")[0];
        const key = `${a.chosenMember.id}-${a.chore.id}-${today}`;
        if (map.has(key)) map.get(key)!.quantity += a.quantity;
        else map.set(key, { ...a });
    });
    return [...map.values()];
};
