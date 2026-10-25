import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import {
  CONTACT_EMAIL,
  GRIEVANCE_ACK_HOURS,
  GRIEVANCE_RESOLVE_DAYS,
  OPERATOR_COUNTRY,
  OPERATOR_NAME,
} from "@/lib/legal";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.privacy");
  return { title: t("title"), description: t("description") };
}

const mail = <a href={`mailto:${CONTACT_EMAIL}`}>{CONTACT_EMAIL}</a>;

// TODO(legal): name the production AI provider and the regions of Vercel,
// Upstash, Sentry and Better Stack (and whether CERT-In's 180-day log rule
// also expects the logs to stay in India), then have the policy reviewed by
// an Indian tech lawyer before v1.0.0.
const PROCESSORS = [
  [
    "Vercel",
    "Hosts the app; keeps short-lived request logs (IP address, browser), counts page views and measures page speed (load and response times, device type) without cookies.",
    "Logs: short-lived. Analytics and speed: aggregate figures only",
  ],
  [
    "Upstash",
    "Stores maps you choose to share, a view count for each, and per-IP request counters that stop abuse.",
    "Shared maps: 60 days after the last view. Counters: up to an hour",
  ],
  [
    "Our AI model provider",
    "Turns your destination, trip length and pace into a draft route.",
    "We don't store your answers",
  ],
  [
    "Sentry",
    "Receives error reports (what broke, browser and page) so we can fix bugs. IP addresses and request bodies are switched off.",
    "Per Sentry's retention, typically 30 to 90 days",
  ],
  [
    "Better Stack",
    "Regularly checks that the site is up, and keeps server error logs (the page type, error type and a reference number) so we can fix problems. No IP addresses or request contents are sent.",
    "Logs: 3 days. Uptime checks: no personal data",
  ],
  [
    "Photon by komoot",
    "Answers city searches; your browser sends the text you type.",
    "Under komoot's own policy",
  ],
  [
    "OpenFreeMap",
    "Serves the map tiles your browser loads.",
    "Under OpenFreeMap's own policy",
  ],
  [
    "Frankfurter",
    "Supplies exchange rates to our server. No personal data is sent.",
    "Not applicable",
  ],
] as const;

const SECTIONS: readonly LegalSection[] = [
  {
    id: "who",
    title: "Who we are",
    body: (
      <p>
        Grand Tour is run by {OPERATOR_NAME}, an individual based in{" "}
        {OPERATOR_COUNTRY}, who decides how your data is used (the “data controller”
        or “data fiduciary”). Reach us at {mail}.
      </p>
    ),
  },
  {
    id: "collect",
    title: "What we collect",
    body: (
      <>
        <p>
          There are no accounts, so we never ask for your name, email or password.
        </p>
        <ul>
          <li>
            <strong>Maps you share.</strong> When you press Share, a copy of that map
            (title, stops, legs, notes on stops) is stored so the link works. Anyone
            with the link can view it.
          </li>
          <li>
            <strong>Your AI answers.</strong> The destination, number of days and
            pace you give the planner are sent to our AI model provider to draft a
            route. We don’t keep them.
          </li>
          <li>
            <strong>Technical data.</strong> Like any website, our host sees your IP
            address and browser details with each request. We use them to keep the
            service running, block abuse and count visits by country, and keep server
            logs for a few days.
          </li>
          <li>
            <strong>Error reports</strong> when something breaks, without your IP
            address.
          </li>
        </ul>
        <p>
          Don’t put sensitive personal details (passport numbers, health information)
          into a map you plan to share.
        </p>
      </>
    ),
  },
  {
    id: "browser",
    title: "Your browser storage",
    body: (
      <p>
        Grand Tour uses no cookies. Your unshared maps, packing ticks, notes, theme
        and display units are saved in your browser’s local storage so they are there
        next time. They never reach us unless you share a map. Clearing your browser
        data deletes them, and we cannot recover them.
      </p>
    ),
  },
  {
    id: "processors",
    title: "Who processes it",
    body: (
      <>
        <p>We rely on these services, each only for the purpose listed:</p>
        <div className="overflow-x-auto rounded-xl border border-line">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <thead className="text-xs text-muted-foreground">
              <tr>
                <th className="p-3 font-medium">Service</th>
                <th className="p-3 font-medium">What it does</th>
                <th className="p-3 font-medium">Kept for</th>
              </tr>
            </thead>
            <tbody>
              {PROCESSORS.map(([name, purpose, retention]) => (
                <tr key={name} className="border-t border-line align-top">
                  <td className="p-3 font-medium text-ink">{name}</td>
                  <td className="p-3">{purpose}</td>
                  <td className="p-3">{retention}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Some of these services run outside your country, including in the United
          States and the European Union. We don’t sell your data or use it for
          advertising.
        </p>
      </>
    ),
  },
  {
    id: "why",
    title: "Why we use it",
    body: (
      <ul>
        <li>
          <strong>To give you what you asked for:</strong> drafting a route,
          searching for a city, keeping a shared link alive.
        </li>
        <li>
          <strong>To keep the service safe and working:</strong> rate limits, error
          reports and visit counts. Under the GDPR this is our legitimate interest.
        </li>
      </ul>
    ),
  },
  {
    id: "rights",
    title: "Your rights",
    body: (
      <>
        <p>
          You can ask us to access, correct or delete your data, or object to how we
          use it. To remove a map you shared, email {mail} with its link; without
          accounts we can’t otherwise tell who made it. You can also nominate someone
          to act for you under India’s Digital Personal Data Protection Act.
        </p>
        <p>
          If you are in the EU or UK you can also complain to your local data
          protection authority.
        </p>
      </>
    ),
  },
  {
    id: "children",
    title: "Children",
    body: (
      <p>
        Grand Tour is not aimed at children. If you are under 18, please use it with
        a parent or guardian’s permission. We don’t knowingly collect data about
        children; if you think we have, contact us and we will delete it.
      </p>
    ),
  },
  {
    id: "tracking",
    title: "Do Not Track",
    body: (
      <p>
        We don’t track you across other websites and don’t allow third parties to, so
        we treat every visitor the same whether or not their browser sends a Do Not
        Track signal.
      </p>
    ),
  },
  {
    id: "grievances",
    title: "Grievances and contact",
    body: (
      <p>
        Our Grievance Officer is {OPERATOR_NAME}, at {mail}. We acknowledge
        complaints within {GRIEVANCE_ACK_HOURS} hours and resolve them within{" "}
        {GRIEVANCE_RESOLVE_DAYS} days. If this notice changes, we update the date at
        the top.
      </p>
    ),
  },
];

// The policy text itself stays here as a versioned legal document; only
// the page chrome is read from the catalog (see docs/ARCHITECTURE.md).
export default function PrivacyPage() {
  const t = useTranslations("Legal.privacyPage");
  return (
    <LegalPage
      eyebrow={t("eyebrow")}
      title={t("title")}
      sections={SECTIONS}
      summary={
        <p>
          <strong>In short:</strong> no account, no cookies, no ads. Your maps stay
          in your browser until you share one. Shared maps disappear after 60 days
          without a view. What you tell the AI planner goes to our AI model provider
          to draft your route, and we don’t keep it.
        </p>
      }
    />
  );
}
