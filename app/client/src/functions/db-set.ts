import { request } from "./api-utils";
import { toDbAssignment } from "./assignments";

export const setCount = (uiCount: UiCount): Promise<boolean> =>
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

export const addAssignment = (uiAssignment: UiAssignment): Promise<boolean> =>
    request("POST", "/api/assignments?action=add", toDbAssignment(uiAssignment)).then(
        r => r.ok
    );

export const replaceAssignments = (uiAssignments: UiAssignment[]): Promise<boolean> => {
    const today = new Date().toISOString().split("T")[0];
    return request(
        "POST",
        `/api/assignments?action=replace&date=${today}`,
        uiAssignments.map(toDbAssignment)
    ).then(r => r.ok);
};
