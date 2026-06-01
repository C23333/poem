import { INTEREST_TAGS } from "@/config/site";

export type SubscriptionInput = {
  email: string;
  interestTags: string[];
};

type SubscriptionRow = {
  id: string;
  email: string;
  interest_tags: string;
  status: string;
  created_at: string;
  updated_at: string;
};

const interestSlugs: ReadonlySet<string> = new Set(INTEREST_TAGS.map((tag) => tag.slug));

function normalizeEmail(value: unknown): string {
  const email = typeof value === "string" ? value.trim().toLowerCase() : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw new Error("A valid email is required.");
  }
  return email;
}

function normalizeInterestTags(value: unknown): string[] {
  const rawTags = Array.isArray(value) ? value : typeof value === "string" ? [value] : [];
  return Array.from(
    new Set(rawTags.filter((tag): tag is string => typeof tag === "string" && interestSlugs.has(tag)))
  );
}

export function parseSubscriptionBody(body: unknown): SubscriptionInput {
  const input = body && typeof body === "object" ? (body as Record<string, unknown>) : {};
  return {
    email: normalizeEmail(input.email),
    interestTags: normalizeInterestTags(input.interestTags)
  };
}

export async function hashSubscriptionToken(token: string): Promise<string> {
  const bytes = new TextEncoder().encode(token);
  const digest = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(digest))
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}

export function isSubscriptionRow(row: unknown): row is SubscriptionRow {
  const candidate = row as SubscriptionRow;
  return Boolean(
    row &&
      typeof row === "object" &&
      typeof candidate.id === "string" &&
      typeof candidate.email === "string" &&
      typeof candidate.interest_tags === "string" &&
      typeof candidate.status === "string" &&
      typeof candidate.created_at === "string" &&
      typeof candidate.updated_at === "string"
  );
}

export function serializeSubscriptionRow(row: SubscriptionRow) {
  return {
    id: row.id,
    email: row.email,
    interestTags: normalizeInterestTags(JSON.parse(row.interest_tags)),
    status: row.status,
    createdAt: row.created_at,
    updatedAt: row.updated_at
  };
}
