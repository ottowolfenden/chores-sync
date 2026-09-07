export const getDateString = (date: Date | string = new Date()): string =>
    new Date(date).toISOString().split("T")[0]!;

export const offsetDate = (date: Date | string, days: number) => {
    const clone = new Date(date);
    clone.setUTCDate(clone.getUTCDate() + days);
    return clone;
};

export const getDateOnlyVal = (date: Date | string = new Date()) => {
    date = new Date(date);
    return Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate());
};

export const getDayDiff = (minuend: Date | string, subtrahend: Date | string) =>
    (getDateOnlyVal(minuend) - getDateOnlyVal(subtrahend)) / (1000 * 60 * 60 * 24);

export const getDateRange = (min: Date | string, max: Date | string) =>
    Array.from({ length: getDayDiff(max, min) + 1 }, (_, i) =>
        getDateString(offsetDate(min, i))
    );

export const formatDate = (date: Date | string, opts: Intl.DateTimeFormatOptions) =>
    new Intl.DateTimeFormat("en-GB", { timeZone: "UTC", ...opts }).format(new Date(date));

export const getNextDate = (dayName: string) => {
    for (let i = 1; i <= 7; i++) {
        const date = offsetDate(new Date(), i);
        if (formatDate(date, { weekday: "long" }) == dayName) return date;
    }
    throw new Error("no date found");
};

export const formatDayOfMonth = (date: Date) => {
    const n = date.getUTCDate();
    return `${n}${n >= 11 && n <= 13 ? "th" : ({ 1: "st", 2: "nd", 3: "rd" }[n % 10] ?? "th")}`;
};

export const formatDateRelative = (date: Date | string) => {
    date = new Date(date);
    const val = getDateOnlyVal;
    const today = new Date();
    const isSameYr = date.getUTCFullYear() == today.getUTCFullYear();
    const isSameMonth = date.getUTCMonth() == today.getUTCMonth();
    const isPast = val(date) < val(today);

    if (val(date) == val(today)) return "Today";
    if (val(date) == val(offsetDate(today, -1))) return "Yesterday";
    if (val(date) == val(offsetDate(today, 1))) return "Tomorrow";
    if (!isPast && val(date) <= val(getNextDate("Sunday")))
        return formatDate(date, { weekday: "long" });
    return [
        formatDate(date, { weekday: "long" }),
        formatDayOfMonth(date),
        ...(isSameMonth ? [] : [formatDate(date, { month: "short" })]),
        ...(isSameYr ? [] : [formatDate(date, { year: "numeric" })])
    ].join(" ");
};

export const formatDateShort = (date: Date | string) => {
    date = new Date(date);
    return formatDate(date, { day: "2-digit", month: "2-digit", year: "2-digit" });
};
