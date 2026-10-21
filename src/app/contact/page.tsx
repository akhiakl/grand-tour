import type { Metadata } from "next";
import Link from "next/link";

import { CopyEmail } from "@/components/legal/copy-email";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import {
  CONTACT_EMAIL,
  GRIEVANCE_ACK_HOURS,
  GRIEVANCE_RESOLVE_DAYS,
  OPERATOR_COUNTRY,
  OPERATOR_NAME,
} from "@/lib/legal";
import { GUEST_MAX_CITIES } from "@/lib/trip";

export const metadata: Metadata = {
  title: "Contact",
  description: "Feedback, privacy requests and map reports for Grand Tour.",
};

const SECTIONS: readonly LegalSection[] = [
  {
    id: "write",
    title: "What to write about",
    body: (
      <ul>
        <li>
          <strong>Feedback and bugs.</strong> What you tried, what happened, and the
          page or map link if there is one.
        </li>
        <li>
          <strong>Report a map.</strong> Use “Report this map” on the map itself, or
          send its link and what’s wrong with it.
        </li>
        <li>
          <strong>Privacy requests.</strong> Access, correction or deletion of your
          data, including removing a map you shared (send its link). See the{" "}
          <Link href="/privacy">Privacy notice</Link>.
        </li>
      </ul>
    ),
  },
  {
    id: "grievance",
    title: "Grievance Officer",
    body: (
      <p>
        {OPERATOR_NAME}, {OPERATOR_COUNTRY} · {CONTACT_EMAIL}. Complaints are
        acknowledged within {GRIEVANCE_ACK_HOURS} hours and resolved within{" "}
        {GRIEVANCE_RESOLVE_DAYS} days.
      </p>
    ),
  },
  {
    id: "faq",
    title: "Before you write",
    body: (
      <ul>
        <li>
          <strong>Lost a map?</strong> Unshared maps live only in the browser where
          you made them, so we can’t restore them.
        </li>
        <li>
          <strong>Link stopped working?</strong> Shared maps expire 60 days after
          their last view. Share the map again from My Maps for a fresh link.
        </li>
        <li>
          <strong>Need more than {GUEST_MAX_CITIES} stops?</strong> Longer
          itineraries are coming with sign-up; for now, split a long journey into two
          maps.
        </li>
      </ul>
    ),
  },
];

export default function ContactPage() {
  return (
    <LegalPage
      eyebrow="Get in touch"
      title="Contact"
      updated={false}
      sections={SECTIONS}
      summary={
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">
            One inbox for feedback, privacy requests and map reports.
          </p>
          <CopyEmail email={CONTACT_EMAIL} />
          <p className="text-sm text-ink-soft">
            Grand Tour is run by {OPERATOR_NAME}, an individual based in{" "}
            {OPERATOR_COUNTRY}. We usually reply within a few working days.
          </p>
        </div>
      }
    />
  );
}
