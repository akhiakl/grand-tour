/** ISO 3166-1 alpha-2 code ("at") → regional-indicator flag emoji ("🇦🇹"). */
export function countryCodeToFlag(code: string): string {
  if (!/^[a-z]{2}$/i.test(code)) return "🏳️";
  return [...code.toUpperCase()]
    .map((char) => String.fromCodePoint(127397 + char.charCodeAt(0)))
    .join("");
}
