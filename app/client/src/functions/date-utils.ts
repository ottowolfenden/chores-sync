export const getDateString = (date?: Date | string): string => {
    date ??= new Date();
    return new Date(date).toISOString().split("T")[0]!;
};

export const offsetDate = (date: Date, days: number) => {
    const clone = new Date(date);
    clone.setDate(date.getDate() + days);
    return clone;
};

export const subtractDates = (minuend: Date | string, subtrahend: Date | string) =>
    (new Date(minuend).getTime() - new Date(subtrahend).getTime()) / (1000 * 60 * 60 * 24);
