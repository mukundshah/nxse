/**
 * Helper to find if value is a valid Object or
 * not
 */
export function isObject(value: any): boolean {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}
