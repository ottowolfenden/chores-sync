export class Timer {
    private constructor() {}

    static delay = async (ms: number) => await new Promise(r => setTimeout(r, ms));
}
