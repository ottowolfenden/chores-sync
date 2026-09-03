import { request } from "./api-utils";
import { toDbAssignment } from "./assignments";

const timeout = 10000;

export const setCount = async (uiCount: UiCount): Promise<boolean> =>
    request(
        "PUT",
        "/api/counts",
        uiCount.memberCounts.map(mc => ({
            "chore_name": uiCount.choreName,
            "is_offset": true,
            "member_name": mc.memberName,
            "total": mc.offset
        }))
    ).then(r => r.ok);

export const addAssignment = async (uiAssignment: UiAssignment): Promise<boolean> => {
    const guess = localStorage.getItem("secret");
    if (!guess) return false;
    const response = await fetch("/api/assignments?action=add", {
        method: "POST",
        headers: { "Authorization": guess },
        body: JSON.stringify(toDbAssignment(uiAssignment)),
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);
    return response?.ok ?? false;
};

export const replaceAssignments = async (uiAssignments: UiAssignment[]): Promise<boolean> => {
    const guess = localStorage.getItem("secret");
    if (!guess) return false;
    const today = new Date().toISOString().split("T")[0];
    const response = await fetch(`/api/assignments?action=replace&date=${today}`, {
        method: "POST",
        headers: { "Authorization": guess },
        body: JSON.stringify(uiAssignments.map(toDbAssignment)),
        signal: AbortSignal.timeout(timeout)
    }).catch(() => null);
    return response?.ok ?? false;
};
