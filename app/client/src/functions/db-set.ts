import { UiAssignment } from "../classes/ui-assignment";
import { UiCount } from "../classes/ui-count";
import { UiMember } from "../classes/ui-member";
import { request } from "./api-utils";
import { getDateString } from "./date-utils";

export const setCount = (uiCount: UiCount): Promise<boolean> =>
    request(
        "PUT",
        "/api/counts",
        uiCount.memberCounts.map(
            (mc): DbCount => ({
                "chore_name": uiCount.choreName,
                "is_offset": true,
                "member_name": mc.memberName,
                "total": mc.offset
            })
        )
    ).then(r => r.ok);

export const addAssignment = (uiAssignment: UiAssignment): Promise<boolean> =>
    request(
        "POST",
        ["/api/assignments", { "action": "add" }],
        uiAssignment.toDbAssignment()
    ).then(r => r.ok);

export const replaceAssignments = (
    uiAssignments: UiAssignment[],
    date: string = getDateString()
): Promise<boolean> =>
    request(
        "POST",
        ["/api/assignments", { "action": "replace", date }],
        uiAssignments.map(a => a.toDbAssignment())
    ).then(r => r.ok);

export const updateMember = (uiMember: UiMember) =>
    request("PUT", "api/members", uiMember.toDbMember()).then(r => r.ok);
