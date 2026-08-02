const REGIONAL_INDICATOR_OFFSET = 0x1f1e6 - "A".charCodeAt(0);

/** Converts an ISO 3166-1 alpha-2 country code to its flag emoji; "" if not a valid code. */
export function countryCodeToFlag(code: string | undefined): string {
  if (!code || !/^[a-zA-Z]{2}$/.test(code)) return "";
  return code
    .toUpperCase()
    .split("")
    .map((letter) =>
      String.fromCodePoint(letter.charCodeAt(0) + REGIONAL_INDICATOR_OFFSET),
    )
    .join("");
}
