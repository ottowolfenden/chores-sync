export const ok = <T>(data?: T): Success<T> => (data ? { ok: true, data } : { ok: true });
export const error = (status = 500, message: string | null = null): Failure => ({
    ok: false,
    status,
    message
});

export const response = <T>(result: Result<T>) =>
    result.ok
        ? Response.json(result.data)
        : Response.json(result.message ? { error: result.message } : null, {
              status: result.status
          });
