export const strformat = (str: string, params: Record<string, string>): string => {
  return str.replace(/{([^{}]*)}/g, (match, key) => {
    return params[key] || match;
  });
};

export const slugify = (str: string): string => {
  return str
    .toLowerCase()
    .replace(/ /g, '-') // Replace spaces with -
    .replace(/[^a-z0-9-]/g, '-') // Remove all non-word characters
    .replace(/-+/g, '-'); // Replace multiple - with single -
}
