import { UiMember } from "../classes/ui-member";
import { formatOrdinal } from "./num-utils";

export const msPerDay = 86_400_000;

export const getDateString = (date: Date | string | number = new Date()): string =>
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

export const formatDateRelative = (
    date: Date | string,
    { collapseDayName = false, collapseMonth = false, collapseDayNum = false } = {}
) => {
    date = new Date(date);
    const val = getDateOnlyVal;
    const today = new Date();
    const yrSame = date.getUTCFullYear() == today.getUTCFullYear();
    const monthSame = yrSame && date.getUTCMonth() == today.getUTCMonth();

    collapseDayName &&= !monthSame;
    collapseDayNum &&= !yrSame;

    if (val(date) == val(today)) return "Today";
    if (val(date) == val(offsetDate(today, -1))) return "Yesterday";
    if (val(date) == val(offsetDate(today, 1))) return "Tomorrow";
    if (val(date) > val(today) && val(date) <= val(getNextDate("Sunday")))
        return formatDate(date, { weekday: "long" });
    return [
        ...(yrSame ? [formatDate(date, { weekday: collapseDayName ? "short" : "long" })] : []),
        collapseDayNum ? date.getUTCDate() : formatOrdinal(date.getUTCDate()),
        ...(!monthSame ? [formatDate(date, { month: collapseMonth ? "short" : "long" })] : []),
        ...(!yrSame ? [formatDate(date, { year: "numeric" })] : [])
    ].join(" ");
};

export const formatDateShort = (date: Date | string) => {
    date = new Date(date);
    return formatDate(date, { day: "2-digit", month: "2-digit", year: "2-digit" });
};

export const getBirthdaysMatch = (members: UiMember[], date: string | Date): boolean =>
    members
        .map(m => m.dateOfBirth)
        .filter(b => b != null)
        .some(
            b =>
                b.getUTCDate() == new Date(date).getUTCDate() &&
                b.getUTCMonth() == new Date(date).getUTCMonth()
        );

export const getDateIsValid = (date: string): boolean =>
    /^\d{4}-\d{2}-\d{2}$/.test(date) && !isNaN(Date.parse(date));

export const getTimestampRanges = (
    dateMultiRange: string
): { first: number; last: number }[] => {
    const ranges = [...dateMultiRange.matchAll(/\[([^,]+),([^)]+)\)/g)].map(
        ([_, start, end]) => [start, end]
    );

    if (
        !ranges.every(
            r => r.length == 2 && r.every(s => s && (getDateIsValid(s) || s == "infinity"))
        )
    )
        throw new Error("invalid datemultirange");

    return ranges.map(r => ({
        first: r[0] == "infinity" ? Infinity : getDateOnlyVal(r[0]),
        last: r[1] == "infinity" ? Infinity : getDateOnlyVal(offsetDate(r[1]!, -1))
    }));
};
export const toDateMultiRange = (timestampRange: { first: number; last: number }[]): string =>
    `{${timestampRange
        .map(
            p =>
                `[${getDateString(p.first)},${
                    p.last == Infinity ? "infinity" : getDateString(p.last + msPerDay)
                })`
        )
        .join(",")}}`;
