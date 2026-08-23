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
    uuid: `${string}-${string}-${string}-${string}-${string}`;
    date: Date;
    quantity: number;
    chore: UiChore;
    turnMember: UiMember;
    chosenMember: UiMember;
};

type UiCount = {
    choreName: string;
    memberCounts: {
        memberName: string;
        total: number;
        offset: number;
    }[];
};

type UiTurn = { chore: UiChore; member: UiMember };
