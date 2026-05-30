export function dailyPoemSlug(slugs: string[], date: Date): string {
  if (slugs.length === 0) {
    throw new Error("dailyPoemSlug requires at least one slug");
  }

  const dayNumber = Math.floor(date.getTime() / 86_400_000);
  return slugs[(dayNumber + 1) % slugs.length];
}
