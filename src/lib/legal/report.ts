import { CONTACT_EMAIL } from "./operator";

/**
 * Fields a notice of illegal content should carry (EU DSA Art. 16(2)):
 * reason, exact location, explanation, optional identity, good faith.
 */
const REPORT_BODY = [
  "Reason (illegal content, spam or scam, copyright, personal information, child safety, other):",
  "",
  "What's wrong and why:",
  "",
  "Your name (optional):",
  "",
  "I believe the information in this report is accurate and complete.",
].join("\n");

// TODO(legal): replace the mailto with a report dialog posting to a
// rate-limited route, plus an in-voice "This map was removed" state.
/** A `mailto:` link that pre-fills a report about the map at `mapUrl`. */
export function reportMapMailto(mapUrl: string): string {
  const subject = `Report a map: ${mapUrl}`;
  const body = `Map: ${mapUrl}\n\n${REPORT_BODY}`;
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
