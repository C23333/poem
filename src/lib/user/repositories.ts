type Statement = {
  sql: string;
  params: Array<string | number | null>;
};

export function createUserStatement(input: { id: string; email: string; displayName?: string }): Statement {
  return {
    sql: "INSERT INTO users (id, email, display_name) VALUES (?, ?, ?)",
    params: [input.id, input.email, input.displayName ?? null]
  };
}

export function findUserByEmailQuery(email: string): Statement {
  return {
    sql: "SELECT id, email, display_name, created_at, updated_at FROM users WHERE email = ?",
    params: [email]
  };
}

export function createUserIdentityStatement(input: {
  id: string;
  userId: string;
  provider: string;
  providerUserId: string;
}): Statement {
  return {
    sql: "INSERT INTO user_identities (id, user_id, provider, provider_user_id) VALUES (?, ?, ?, ?)",
    params: [input.id, input.userId, input.provider, input.providerUserId]
  };
}

export function savePreferencesStatement(input: {
  userId: string;
  readingMode: string;
  helperLanguage: string;
  interestTags: string[];
  emailDailyEnabled: boolean;
}): Statement {
  return {
    sql: `
      INSERT INTO user_preferences (user_id, reading_mode, helper_language, interest_tags, email_daily_enabled)
      VALUES (?, ?, ?, ?, ?)
      ON CONFLICT(user_id) DO UPDATE SET
        reading_mode = excluded.reading_mode,
        helper_language = excluded.helper_language,
        interest_tags = excluded.interest_tags,
        email_daily_enabled = excluded.email_daily_enabled,
        updated_at = CURRENT_TIMESTAMP
    `,
    params: [
      input.userId,
      input.readingMode,
      input.helperLanguage,
      JSON.stringify(input.interestTags),
      input.emailDailyEnabled ? 1 : 0
    ]
  };
}

export function preferencesQuery(userId: string): Statement {
  return {
    sql: "SELECT user_id, reading_mode, helper_language, interest_tags, email_daily_enabled, updated_at FROM user_preferences WHERE user_id = ?",
    params: [userId]
  };
}

export function savePoemStatement(input: { userId: string; poemSlug: string }): Statement {
  return {
    sql: "INSERT OR IGNORE INTO saved_poems (user_id, poem_slug) VALUES (?, ?)",
    params: [input.userId, input.poemSlug]
  };
}

export function savedPoemsQuery(userId: string): Statement {
  return {
    sql: "SELECT user_id, poem_slug, created_at FROM saved_poems WHERE user_id = ? ORDER BY created_at DESC",
    params: [userId]
  };
}

export function deleteSavedPoemStatement(input: { userId: string; poemSlug: string }): Statement {
  return {
    sql: "DELETE FROM saved_poems WHERE user_id = ? AND poem_slug = ?",
    params: [input.userId, input.poemSlug]
  };
}

export function createReadingHistoryStatement(input: {
  id: string;
  userId: string;
  poemSlug: string;
  locale: string;
}): Statement {
  return {
    sql: "INSERT INTO reading_history (id, user_id, poem_slug, locale) VALUES (?, ?, ?, ?)",
    params: [input.id, input.userId, input.poemSlug, input.locale]
  };
}

export function createSubscriptionStatement(input: {
  id: string;
  userId?: string;
  email: string;
  interestTags: string[];
  status: "pending" | "active" | "unsubscribed";
  unsubscribeTokenHash: string;
}): Statement {
  return {
    sql: `
      INSERT INTO subscriptions (id, user_id, email, interest_tags, status, unsubscribe_token_hash)
      VALUES (?, ?, ?, ?, ?, ?)
    `,
    params: [
      input.id,
      input.userId ?? null,
      input.email,
      JSON.stringify(input.interestTags),
      input.status,
      input.unsubscribeTokenHash
    ]
  };
}

export function submitCommentStatement(input: {
  id: string;
  userId: string;
  poemSlug: string;
  body: string;
}): Statement {
  return {
    sql: "INSERT INTO comments (id, user_id, poem_slug, body, status) VALUES (?, ?, ?, ?, ?)",
    params: [input.id, input.userId, input.poemSlug, input.body, "pending"]
  };
}

export function approvedCommentsQuery(poemSlug: string): Statement {
  return {
    sql: "SELECT id, user_id, poem_slug, body, created_at FROM comments WHERE poem_slug = ? AND status = 'approved' ORDER BY created_at DESC",
    params: [poemSlug]
  };
}

export function createModerationEventStatement(input: {
  id: string;
  commentId: string;
  moderatorUserId?: string;
  action: string;
  reason?: string;
}): Statement {
  return {
    sql: "INSERT INTO moderation_events (id, comment_id, moderator_user_id, action, reason) VALUES (?, ?, ?, ?, ?)",
    params: [input.id, input.commentId, input.moderatorUserId ?? null, input.action, input.reason ?? null]
  };
}

export function moderateCommentStatement(input: { id: string; status: "approved" | "rejected" }): Statement {
  return {
    sql: "UPDATE comments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
    params: [input.status, input.id]
  };
}
