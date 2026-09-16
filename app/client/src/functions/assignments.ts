import { getDateString } from "./date-utils";

export const cloneAndSum = (
    assignments: UiAssignment[] | null | undefined
): UiAssignment[] => {
    if (!assignments) return [];
    const map = new Map<string, UiAssignment>();
    assignments.forEach(a => {
        const key = `${a.chosenMember.id}-${a.chore.id}-${getDateString()}`;
        if (map.has(key)) map.get(key)!.quantity += a.quantity;
        else map.set(key, { ...a });
    });
    return [...map.values()];
};
