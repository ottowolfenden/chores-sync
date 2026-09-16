import { request } from "./api-utils";
import { toDbAssignment, toDbMember } from "./type-conversions";
import { getDateString } from "./date-utils";

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
    request(
        "POST",
        ["/api/assignments", { "action": "add" }],
        toDbAssignment(uiAssignment)
    ).then(r => r.ok);

export const replaceAssignments = (
    uiAssignments: UiAssignment[],
    date: string = getDateString()
): Promise<boolean> =>
    request(
        "POST",
        ["/api/assignments", { "action": "replace", date }],
        uiAssignments.map(toDbAssignment)
    ).then(r => r.ok);

export const updateMember = (uiMember: UiMember) =>
    request("PUT", "api/members", toDbMember(uiMember)).then(r => r.ok);
