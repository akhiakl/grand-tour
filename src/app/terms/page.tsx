import type { Metadata } from "next";

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
  title: "Terms",
  description: "The rules for using Grand Tour and sharing maps with it.",
};

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "about",
    title: "About these terms",
    body: (
      <p>
        Grand Tour is run by {OPERATOR_NAME}, an individual based in{" "}
        {OPERATOR_COUNTRY}. By using Grand Tour, generating a route or sharing a map,
        you agree to these terms. If you don’t agree, please don’t use the service.
      </p>
    ),
  },
  {
    id: "service",
    title: "The service",
    body: (
      <p>
        Grand Tour is free and needs no account. Guest maps hold up to{" "}
        {GUEST_MAX_CITIES} stops. We may change, pause or stop any part of the
        service, and we will try to give notice of big changes.
      </p>
    ),
  },
  {
    id: "sharing",
    title: "Your maps and shared links",
    body: (
      <ul>
        <li>
          You own what you put in your maps. When you share one, you let us store it
          and show it to anyone who has the link, for as long as the link lives.
        </li>
        <li>
          Shared links are not secret: anyone you send one to can pass it on. A
          shared map expires 60 days after its last view.
        </li>
        <li>
          Shared maps are snapshots. Editing after sharing means sharing again, which
          creates a new link.
        </li>
        <li>You are responsible for what you share.</li>
      </ul>
    ),
  },
  {
    id: "rules",
    title: "What you must not share",
    body: (
      <>
        <p>Don’t use Grand Tour to share anything that:</p>
        <ul>
          <li>is illegal, or promotes or helps illegal activity;</li>
          <li>harms children in any way;</li>
          <li>harasses, threatens, defames or impersonates someone;</li>
          <li>reveals someone’s personal information without their consent;</li>
          <li>infringes someone else’s copyright or other rights;</li>
          <li>is spam, a scam, malware or a phishing link.</li>
        </ul>
        <p>
          Don’t try to break, overload or scrape the service. We may remove any map
          that breaks these rules, without notice.
        </p>
      </>
    ),
  },
  {
    id: "ai",
    title: "AI suggestions",
    body: (
      <p>
        Routes from the AI planner are drafts. They can be wrong, incomplete or out
        of date. Check transport, prices, visas, opening hours, health and safety
        advice with official sources before you book or travel. You decide what to do
        with a suggestion.
      </p>
    ),
  },
  {
    id: "data",
    title: "Map data",
    body: (
      <p>
        Maps use data © OpenStreetMap contributors, available under the Open Database
        License, with tiles from OpenFreeMap and search by Photon (komoot). Exchange
        rates are indicative only.
      </p>
    ),
  },
  {
    id: "reports",
    title: "Reporting a map",
    body: (
      <p>
        To report a shared map, use “Report this map” on its page or email {mail}{" "}
        with the link and the reason. We acknowledge reports within{" "}
        {GRIEVANCE_ACK_HOURS} hours, resolve them within {GRIEVANCE_RESOLVE_DAYS}{" "}
        days, and act on valid legal orders.
      </p>
    ),
  },
  {
    id: "liability",
    title: "No warranty and liability",
    body: (
      <>
        <p>
          Grand Tour is provided “as is”, without warranties of any kind. As far as
          the law allows, we are not liable for indirect or consequential losses,
          lost bookings or travel disruption arising from your use of the service.
        </p>
        <p>
          Nothing in these terms limits rights you have under consumer law that
          cannot be excluded.
        </p>
      </>
    ),
  },
  {
    id: "law",
    title: "Governing law",
    body: (
      // TODO(legal): name the city whose courts have jurisdiction once a
      // lawyer has reviewed these terms.
      <p>
        These terms are governed by the laws of {OPERATOR_COUNTRY}. If you live in
        the EU or UK, you keep the protection of your local consumer law. We may
        update these terms; the date at the top shows the latest version.
      </p>
    ),
  },
];

export default function TermsPage() {
  return (
    <LegalPage
      eyebrow="Terms of use"
      title="Terms"
      sections={SECTIONS}
      summary={
        <p>
          <strong>In short:</strong> Grand Tour is free and as-is. Share only what
          you have the right to share; anyone with a link can see it. AI suggestions
          can be wrong, so check before you travel. We remove maps that break the
          rules.
        </p>
      }
    />
  );
}
