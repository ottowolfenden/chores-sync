export const cloneAndSum = (
    assignments: UiAssignment[] | null | undefined
): UiAssignment[] => {
    if (!assignments) return [];
    const map = new Map<string, UiAssignment>();
    assignments.forEach(a => {
        const today = new Date(a.date).toISOString().split("T")[0];
        const key = `${a.chosenMember.id}-${a.chore.id}-${today}`;
        if (map.has(key)) map.get(key)!.quantity += a.quantity;
        else map.set(key, { ...a });
    });
    return [...map.values()];
};

export const toDbAssignment = (uiAssignment: UiAssignment): DbAssignment => ({
    "assignment_uuid": uiAssignment.uuid,
    "assign_date": uiAssignment.date,
    "quantity": uiAssignment.quantity,
    "is_offset": false,
    "chore_id": uiAssignment.chore.id,
    "member_id": uiAssignment.chosenMember.id
});
