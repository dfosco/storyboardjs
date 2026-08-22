export function slugifyCanvasPageName(value) {
  const slug = String(value)
    .replace(/([a-z0-9])([A-Z])/g, '$1-$2')
    .replace(/([A-Z])([A-Z][a-z])/g, '$1-$2')
    .replace(/[^A-Za-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .toLowerCase();

  if (!slug) {
    throw new TypeError(
      'Tiny Canvas page filenames must contain a letter or number.'
    );
  }

  return slug;
}
