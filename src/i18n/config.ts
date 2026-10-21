/**
 * The app ships one locale today; every UI string lives in
 * `messages/{locale}.json` so adding a language is a new catalog plus a
 * way to pick it, not a code sweep.
 */
export const DEFAULT_LOCALE = "en";
export const LOCALES = [DEFAULT_LOCALE] as const;
export type AppLocale = (typeof LOCALES)[number];
