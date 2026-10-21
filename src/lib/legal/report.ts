import { CONTACT_EMAIL } from "./operator";

// TODO(legal): replace the mailto with a report dialog posting to a
// rate-limited route, plus an in-voice "This map was removed" state.
/**
 * A `mailto:` link to the contact inbox carrying a map report. The caller
 * supplies the (translated) subject and body; the body should ask for the
 * fields a notice of illegal content carries (EU DSA Art. 16(2)): reason,
 * exact location, explanation, optional identity, good faith.
 */
export function reportMapMailto({
  subject,
  body,
}: {
  readonly subject: string;
  readonly body: string;
}): string {
  return `mailto:${CONTACT_EMAIL}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
}
