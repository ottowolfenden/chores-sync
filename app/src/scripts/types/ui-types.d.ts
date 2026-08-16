type UiMember = {
    id: number;
    name: string;
    isActive: boolean;
    isAdmin: boolean;
};

type UiChore = {
    id: number;
    name: string;
    isDaily: boolean;
    limitPerDay: number?;
};

type UiAssignment = {
    id: number;
    datetime: Date;
    quantity: number;
    chore: Chore;
    member: Member;
};

type UiCount = {
    choreName: string;
    memberCounts: {
        memberName: string;
        total: number;
        offset: number;
    }[];
};
