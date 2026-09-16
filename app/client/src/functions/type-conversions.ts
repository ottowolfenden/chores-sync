export const toDbAssignment = (uiAssignment: UiAssignment): DbAssignment => ({
    "assignment_uuid": uiAssignment.uuid,
    "assign_date": uiAssignment.date,
    "quantity": uiAssignment.quantity,
    "is_offset": false,
    "chore_id": uiAssignment.chore.id,
    "member_id": uiAssignment.chosenMember.id
});

export const toDbMember = (uiMember: UiMember): DbMember => ({
    "member_id": uiMember.id,
    "member_name": uiMember.name,
    "is_active": uiMember.isActive,
    "is_admin": uiMember.isAdmin,
    "date_of_birth": uiMember.dateOfBirth,
    "easter_egg_high_score": uiMember.highScore
});
