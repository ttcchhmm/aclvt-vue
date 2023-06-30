/**
 * Pluralizes a word.
 * @param {number} count The number of entries.
 * @param {string} singular The singular form of the word.
 * @param {string} plural The plural form of the word.
 */
export function pluralize(count, singular, plural) {
    return count === 1 ? singular : plural;
}