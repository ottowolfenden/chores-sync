type DbMember = {
    member_id: number;
    member_name: string;
    is_active: boolean;
    can_edit_history: boolean;
};

type DbChore = {
    chore_id: number;
    chore_name: string;
    daily: boolean;
};

type DbAssignment = {
    assignment_id: number;
    assign_date: Date;
    quantity: number;
    chore_id: number;
    member_id: number;
};
