type Person = {
    name: string;
    canEditToday: boolean;
    canEditHistory: boolean;
};

type Assignment = {
    quantity: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9;
    person: Person;
    completed: boolean;
};

type Chore = {
    name: string;
    icon: string;
    daily: boolean;
    turn: Person;
    assignments: Assignment[];
    date: Date;
};
