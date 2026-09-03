type Method = "GET" | "DELETE" | "HEAD" | "PUT" | "POST" | "PATCH";

type Data<M extends Method> = {
    "GET": undefined;
    "DELETE": undefined;
    "HEAD": Record<string, string>;
    "PUT": unknown;
    "POST": unknown;
    "PATCH": unknown;
}[M];

export const request = async <T = unknown, M extends Method = Method>(
    method: M,
    endpoint: string,
    data?: Data<M>
): Promise<{ ok: boolean; data?: T | null }> => {
    const timeout = 10000;
    const guess = localStorage.getItem("secret");
    if (!guess) return { ok: false };

    let response: Response | null;
    const init: RequestInit = {
        method,
        headers: { "Authorization": guess, "Content-Type": "application/json" },
        signal: AbortSignal.timeout(timeout)
    };

    switch (method) {
        case "GET":
        case "DELETE":
            response = await fetch(endpoint, init).catch(() => null);
            return { ok: response?.ok ?? false, data: await response?.json() };
        case "HEAD":
            response = await fetch(endpoint, {
                ...init,
                headers: { ...init.headers, ...(data as Data<"HEAD">) }
            }).catch(() => null);
            return { ok: response?.ok ?? false };
        case "PUT":
        case "POST":
        case "PATCH":
            response = await fetch(endpoint, {
                ...init,
                body: JSON.stringify(data)
            }).catch(() => null);
            return { ok: response?.ok ?? false };
        default:
            throw new Error("invalid method");
    }
};
