type Member = {
    id: number;
    name: string;
    isActive: boolean;
    canEditToday: boolean;
    canEditHistory: boolean;
};

type Chore = {
    id: number;
    name: string;
    icon: string;
    daily: boolean;
};

type Assignment = {
    id: number;
    chore: Chore;
    member: Member;
    date: Date;
    quantity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    completed: boolean;
};

export type { Member, Assignment, Chore };
