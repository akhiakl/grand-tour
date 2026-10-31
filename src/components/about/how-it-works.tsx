import { useTranslations } from "next-intl";

const STEPS = ["describe", "shape", "share"] as const;

/** The three steps from idea to shared map, in order. */
export function HowItWorks() {
  const t = useTranslations("About.how");
  return (
    <section aria-labelledby="how-title" className="page-container">
      <div className="flex max-w-3xl flex-col gap-4">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2
          id="how-title"
          className="font-display text-section font-medium tracking-tight text-balance text-ink"
        >
          {t("title")}
        </h2>
      </div>
      <ol className="mt-14 grid gap-12 md:grid-cols-3 md:gap-8">
        {STEPS.map((key, i) => (
          <li key={key} className="flex flex-col gap-3 border-t border-line pt-6">
            <span
              aria-hidden
              className="font-display text-section text-brass-text italic"
            >
              {i + 1}
            </span>
            <h3 className="font-display text-title font-medium text-ink">
              {t(`${key}.title`)}
            </h3>
            <p className="max-w-[38ch] text-ink-soft">{t(`${key}.body`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
