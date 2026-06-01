import { describe, expect, it } from "vitest";
import {
  approvedCommentsQuery,
  createModerationEventStatement,
  createReadingHistoryStatement,
  createSubscriptionStatement,
  createUserIdentityStatement,
  createUserStatement,
  findUserByEmailQuery,
  preferencesQuery,
  savePoemStatement,
  savePreferencesStatement,
  savedPoemsQuery,
  submitCommentStatement
} from "./repositories";

describe("user engagement repositories", () => {
  it("builds a user insert statement", () => {
    const statement = createUserStatement({
      id: "user_1",
      email: "reader@example.com"
    });

    expect(statement.sql).toContain("INSERT INTO users");
    expect(statement.params).toEqual(["user_1", "reader@example.com", null]);
  });

  it("builds a user lookup by email query", () => {
    const statement = findUserByEmailQuery("reader@example.com");

    expect(statement.sql).toContain("FROM users");
    expect(statement.sql).toContain("WHERE email = ?");
    expect(statement.params).toEqual(["reader@example.com"]);
  });

  it("builds a user identity insert statement", () => {
    const statement = createUserIdentityStatement({
      id: "identity_1",
      userId: "user_1",
      provider: "email",
      providerUserId: "reader@example.com"
    });

    expect(statement.sql).toContain("INSERT INTO user_identities");
    expect(statement.params).toEqual(["identity_1", "user_1", "email", "reader@example.com"]);
  });

  it("builds a preference upsert statement", () => {
    const statement = savePreferencesStatement({
      userId: "user_1",
      readingMode: "bilingual",
      helperLanguage: "zh",
      interestTags: ["moon", "homesickness"],
      emailDailyEnabled: true
    });

    expect(statement.sql).toContain("INSERT INTO user_preferences");
    expect(statement.params).toEqual([
      "user_1",
      "bilingual",
      "zh",
      JSON.stringify(["moon", "homesickness"]),
      1
    ]);
  });

  it("builds a preference lookup query", () => {
    const statement = preferencesQuery("user_1");

    expect(statement.sql).toContain("FROM user_preferences");
    expect(statement.sql).toContain("WHERE user_id = ?");
    expect(statement.params).toEqual(["user_1"]);
  });

  it("builds an idempotent saved poem statement", () => {
    const statement = savePoemStatement({ userId: "user_1", poemSlug: "jing-ye-si" });

    expect(statement.sql).toContain("INSERT OR IGNORE INTO saved_poems");
    expect(statement.params).toEqual(["user_1", "jing-ye-si"]);
  });

  it("builds a saved poems query", () => {
    const statement = savedPoemsQuery("user_1");

    expect(statement.sql).toContain("FROM saved_poems");
    expect(statement.sql).toContain("ORDER BY created_at DESC");
    expect(statement.params).toEqual(["user_1"]);
  });

  it("builds a reading history insert statement", () => {
    const statement = createReadingHistoryStatement({
      id: "history_1",
      userId: "user_1",
      poemSlug: "jing-ye-si",
      locale: "en"
    });

    expect(statement.sql).toContain("INSERT INTO reading_history");
    expect(statement.params).toEqual(["history_1", "user_1", "jing-ye-si", "en"]);
  });

  it("builds a subscription insert statement", () => {
    const statement = createSubscriptionStatement({
      id: "sub_1",
      email: "reader@example.com",
      interestTags: ["moon"]
    });

    expect(statement.sql).toContain("INSERT INTO subscriptions");
    expect(statement.params).toEqual(["sub_1", null, "reader@example.com", JSON.stringify(["moon"])]);
  });

  it("stores submitted comments as pending", () => {
    const statement = submitCommentStatement({
      id: "comment_1",
      userId: "user_1",
      poemSlug: "jing-ye-si",
      body: "这句很有画面。"
    });

    expect(statement.sql).toContain("INSERT INTO comments");
    expect(statement.params).toEqual(["comment_1", "user_1", "jing-ye-si", "这句很有画面。", "pending"]);
  });

  it("only queries approved comments for public pages", () => {
    const statement = approvedCommentsQuery("jing-ye-si");

    expect(statement.sql).toContain("status = 'approved'");
    expect(statement.params).toEqual(["jing-ye-si"]);
  });

  it("builds a moderation event insert statement", () => {
    const statement = createModerationEventStatement({
      id: "event_1",
      commentId: "comment_1",
      action: "approve",
      reason: "Reviewed manually"
    });

    expect(statement.sql).toContain("INSERT INTO moderation_events");
    expect(statement.params).toEqual(["event_1", "comment_1", null, "approve", "Reviewed manually"]);
  });
});
