/**
 * A type guard for checking if a value is a string.
 *
 * This is useful for functions that expect type guards.
 */
export const isString = <T>(value: unknown): value is string =>
  typeof value === 'string'

/**
 * Check if a type is an Array with every element matching the given predicate.
 */
export const isArrayOf =
  <T>(value: unknown, elementTest: (x: unknown) => x is T): value is T[] =>
    Array.isArray(value) && value.every(x => elementTest(x))
