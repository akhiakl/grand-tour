import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";
import type { ReactNode } from "react";

import { CopyEmail } from "@/components/legal/copy-email";
import { LegalPage, type LegalSection } from "@/components/legal/legal-page";
import { privacyLink } from "@/components/rich-text";
import {
  CONTACT_EMAIL,
  GRIEVANCE_ACK_HOURS,
  GRIEVANCE_RESOLVE_DAYS,
  OPERATOR_COUNTRY,
  OPERATOR_NAME,
} from "@/lib/legal";
import { GUEST_MAX_CITIES, SHARE_TTL_DAYS } from "@/lib/trip";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.contact");
  return { title: t("title"), description: t("description") };
}

const strong = (chunks: ReactNode) => <strong>{chunks}</strong>;

export default function ContactPage() {
  const t = useTranslations("Contact");

  const sections: readonly LegalSection[] = [
    {
      id: "write",
      title: t("write.title"),
      body: (
        <ul>
          <li>{t.rich("write.feedback", { strong })}</li>
          <li>{t.rich("write.report", { strong })}</li>
          <li>
            {t.rich("write.privacy", {
              strong,
              link: privacyLink,
            })}
          </li>
        </ul>
      ),
    },
    {
      id: "grievance",
      title: t("grievance.title"),
      body: (
        <p>
          {t("grievance.body", {
            operator: OPERATOR_NAME,
            country: OPERATOR_COUNTRY,
            email: CONTACT_EMAIL,
            hours: GRIEVANCE_ACK_HOURS,
            days: GRIEVANCE_RESOLVE_DAYS,
          })}
        </p>
      ),
    },
    {
      id: "faq",
      title: t("faq.title"),
      body: (
        <ul>
          <li>{t.rich("faq.lost", { strong })}</li>
          <li>{t.rich("faq.expired", { strong, days: SHARE_TTL_DAYS })}</li>
          <li>{t.rich("faq.stops", { strong, max: GUEST_MAX_CITIES })}</li>
        </ul>
      ),
    },
  ];

  return (
    <LegalPage
      eyebrow={t("eyebrow")}
      title={t("title")}
      updated={false}
      sections={sections}
      summary={
        <div className="flex flex-col gap-3">
          <p className="text-sm text-ink-soft">{t("inbox")}</p>
          <CopyEmail email={CONTACT_EMAIL} />
          <p className="text-sm text-ink-soft">
            {t("operator", { operator: OPERATOR_NAME, country: OPERATOR_COUNTRY })}
          </p>
        </div>
      }
    />
  );
}
