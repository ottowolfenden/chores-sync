export const request = async <T = unknown>(
    method: "GET" | "PUT",
    endpoint: string,
    body?: unknown
): Promise<{ ok: boolean; data?: T | null }> => {
    const timeout = 10000;
    const guess = localStorage.getItem("secret");
    if (!guess) return { ok: false };

    let response: Response | null;
    const init: RequestInit = {
        method,
        headers: { "Authorization": guess },
        signal: AbortSignal.timeout(timeout)
    };

    switch (method) {
        case "GET":
            response = await fetch(endpoint, init).catch(() => null);
            return { ok: response?.ok ?? false, data: await response?.json() };
        case "PUT":
            response = await fetch(endpoint, {
                ...init,
                body: JSON.stringify(body)
            }).catch(() => null);
            return { ok: response?.ok ?? false };
        default:
            throw new Error("invalid method");
    }
};
