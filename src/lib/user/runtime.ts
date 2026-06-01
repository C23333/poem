export type RequestUser = {
  id: string;
  email: string;
  role?: "reader" | "moderator" | "admin";
};

export type D1Like = {
  prepare: (sql: string) => {
    bind: (...params: Array<string | number | null>) => {
      first: () => Promise<unknown>;
      all: () => Promise<{ results?: unknown[] }>;
      run: () => Promise<unknown>;
    };
  };
};

export type KvLike = {
  get: (key: string) => Promise<string | null>;
  put: (key: string, value: string, options?: { expirationTtl?: number }) => Promise<unknown>;
};

type ContextLike = {
  locals?: {
    user?: RequestUser;
    runtime?: {
      env?: Record<string, unknown>;
    };
  };
};

export function getRequestUser(context: ContextLike): RequestUser | undefined {
  return context.locals?.user;
}

export function getD1Database(context: ContextLike): D1Like | undefined {
  const binding = context.locals?.runtime?.env?.POETRY_DB;
  return binding && typeof binding === "object" && "prepare" in binding ? (binding as D1Like) : undefined;
}

export function getRateLimitKv(context: ContextLike): KvLike | undefined {
  const binding = context.locals?.runtime?.env?.POETRY_RATE_LIMIT;
  return binding && typeof binding === "object" && "get" in binding && "put" in binding ? (binding as KvLike) : undefined;
}
