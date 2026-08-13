type Member = {
    id: number;
    name: string;
    isActive: boolean;
    canEditHistory: boolean;
};

type Chore = {
    id: number;
    name: string;
    daily: boolean;
    maxOnePerDay: boolean;
};

type Assignment = {
    id: number;
    date: Date;
    quantity: number;
    chore: Chore;
    member: Member;
};

export type { Member, Assignment, Chore };
