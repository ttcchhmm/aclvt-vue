/**
 * Return the pluralized form of an object.
 * 
 * @param count The number of entries.
 * @param singular The singular form of the word.
 * @param plural The plural form of the word.
 * @returns The pluralized form of the word.
 */
export function pluralize<T>(count: number, singular: T, plural: T) {
    return count === 1 ? singular : plural;
}