// An edit made to a draft before publication is not a later article update.
// Preserve the source record; omit contradictory public update metadata rather
// than inventing a newer timestamp or changing the original publication date.
export function publicModifiedDate(published, modified) {
  if (typeof published !== 'string' || typeof modified !== 'string') return null;
  const publicationTime = Date.parse(published);
  const modificationTime = Date.parse(modified);
  if (!Number.isFinite(publicationTime) || !Number.isFinite(modificationTime) || modificationTime < publicationTime) return null;
  return modified;
}
