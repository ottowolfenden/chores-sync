type DbMember = {
    "member_id": number;
    "member_name": string;
    "is_admin": boolean;
    "date_of_birth": Date | null;
    "easter_egg_high_score": number;
};

type DbChore = {
    "chore_id": number;
    "chore_name": string;
    "is_daily": boolean;
    "limit_per_day": number | null;
};

type DbAssignment = {
    "assignment_uuid": string;
    "assign_date": Date;
    "quantity": number;
    "is_offset": boolean;
    "chore_id": number;
    "member_id": number;
};

type DbCount = {
    "chore_name": string;
    "member_name": string;
    "is_offset": boolean;
    "total": number;
};

type DbInactivePeriod = {
    "inactive_history_id": number;
    "member_id": number;
    "inactive_period": string;
};

type DbTurnData = {
    "chore_id": number;
    "member_id": number;
    "total": number;
    "last_assign_date": Date | number;
};

type DbTurn = { "chore_id": number; "member_id": number };
