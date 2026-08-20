export class DateOnly {
    private year: number = new Date().getFullYear();
    private month: number = new Date().getMonth() + 1;
    private day: number = new Date().getDate();

    get timestamp() {
        return Date.UTC(this.year, this.month - 1, this.day);
    }

    constructor(param?: number | string | Date, month?: number, day?: number) {
        if (
            (typeof param == "number" &&
                (!month ||
                    !day ||
                    month > 12 ||
                    month < 1 ||
                    day > 31 ||
                    day < 1 ||
                    isNaN(param + month + day) ||
                    Math.trunc(Math.abs(param)) != param ||
                    Math.trunc(Math.abs(month)) != month ||
                    Math.trunc(Math.abs(day)) != day)) ||
            (typeof param == "string" &&
                (!/^\d{4}-\d{2}-\d{2}$/.test(param) || isNaN(Date.parse(param))))
        )
            throw new Error("invalid date");

        const assign = (ymd: [number, number, number]) =>
            ([this.year, this.month, this.day] = ymd);

        if (typeof param == "number") assign([param, month!, day!]);
        else if (typeof param == "string")
            assign(param.split("-").map(Number) as [number, number, number]);
        else if (param == undefined || param instanceof Date) {
            const datetime = param ?? new Date();
            assign([datetime.getFullYear(), datetime.getMonth() + 1, datetime.getDate()]);
        }
    }

    toString = () =>
        `${this.year}-${this.month.toString().padStart(2, "0")}-${this.day.toString().padStart(2, "0")}`;

    valueOf = () => this.timestamp;

    equals = (dateOnly: DateOnly) => this.toString() == dateOnly.toString();

    [Symbol.toPrimitive](type: string) {
        if (type == "number") return this.timestamp;
        return this.toString();
    }
}
