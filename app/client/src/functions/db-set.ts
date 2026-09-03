import { request } from "./api-utils";
import { toDbAssignment } from "./assignments";
import { getToday } from "./date-utils";

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

export const replaceAssignments = (uiAssignments: UiAssignment[]): Promise<boolean> =>
    request(
        "POST",
        `/api/assignments?action=replace&date=${getToday()}`,
        uiAssignments.map(toDbAssignment)
    ).then(r => r.ok);
