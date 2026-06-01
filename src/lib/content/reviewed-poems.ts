import { REVIEWED_POEM_SLUGS } from "./reviewed-poems.generated";

const reviewedPoems = new Set<string>(REVIEWED_POEM_SLUGS);

export function isReviewedPoemSlug(slug: string): boolean {
  return reviewedPoems.has(slug);
}
