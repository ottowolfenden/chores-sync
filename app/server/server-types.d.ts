type Env = { DATABASE_URL: string; SECRET: string };

type Success<T = void> = { ok: true; data?: T };

type Failure = { ok: false; status: number; message: string | null };

type Result<T = void> = Success<T> | Failure;
