export type RequestUser = {
  id: string;
  email: string;
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
