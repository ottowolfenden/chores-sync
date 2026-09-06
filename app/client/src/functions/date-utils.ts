export const getDateString = (date: Date | string = new Date()): string =>
    new Date(date).toISOString().split("T")[0]!;

export const offsetDate = (date: Date | string, days: number) => {
    const clone = new Date(date);
    clone.setDate(clone.getDate() + days);
    return clone;
};

export const getDayDiff = (minuend: Date | string, subtrahend: Date | string) =>
    (new Date(minuend).getTime() - new Date(subtrahend).getTime()) / (1000 * 60 * 60 * 24);

export const getDateRange = (min: Date | string, max: Date | string) =>
    Array.from({ length: getDayDiff(max, min) + 1 }, (_, i) =>
        getDateString(offsetDate(min, i))
    );
