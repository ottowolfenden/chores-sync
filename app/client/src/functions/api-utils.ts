export const request = async <T = unknown>(
    method: "GET",
    endpoint: string,
    body?: unknown
): Promise<{ ok: boolean; data: T | null }> => {
    const guess = localStorage.getItem("secret");
    if (!guess) return { ok: false, data: null };

    switch (method) {
        case "GET":
            const response = await fetch(endpoint, {
                method: method,
                headers: { "Authorization": guess },
                signal: AbortSignal.timeout(10000)
            }).catch(() => null);
            return { ok: response?.ok ?? false, data: await response?.json() };

        default:
            throw new Error("invalid method");
    }
};
