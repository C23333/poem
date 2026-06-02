type ContentEntryLike = {
  id: string;
};

export function entrySlug(entry: ContentEntryLike): string {
  return entry.id;
}
