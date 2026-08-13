type UiMember = {
    id: number;
    name: string;
    isActive: boolean;
    canEditHistory: boolean;
};

type UiChore = {
    id: number;
    name: string;
    daily: boolean;
    maxOnePerDay: boolean;
};

type UiAssignment = {
    id: number;
    date: Date;
    quantity: number;
    chore: Chore;
    member: Member;
};
