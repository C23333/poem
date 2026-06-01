import type { KvLike } from "@/lib/user/runtime";

export async function checkAiDraftRateLimit(
  kv: KvLike,
  input: {
    userId: string;
    dailyLimit: number;
    now?: Date;
  }
) {
  const day = (input.now || new Date()).toISOString().slice(0, 10);
  const key = `ai-draft:${day}:${input.userId}`;
  const existing = await kv.get(key);
  const count = Number.parseInt(existing || "0", 10);

  if (Number.isFinite(count) && count >= input.dailyLimit) {
    return {
      allowed: false,
      error: "Daily AI draft limit reached."
    };
  }

  await kv.put(key, String((Number.isFinite(count) ? count : 0) + 1), { expirationTtl: 60 * 60 * 12 });
  return { allowed: true };
}
