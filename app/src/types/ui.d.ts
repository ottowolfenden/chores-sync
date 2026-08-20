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
    limitPerDay: number | null;
};

type UiAssignment = {
    id: number;
    date: Date;
    quantity: number;
    chore: Chore;
    turnMember: Member;
    chosenMember: Member;
};

type UiCount = {
    choreName: string;
    memberCounts: {
        memberName: string;
        total: number;
        offset: number;
    }[];
};
