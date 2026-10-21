import { MessageSquareText, Route, Share2 } from "lucide-react";
import { useTranslations } from "next-intl";

const STEPS = [
  { icon: MessageSquareText, key: "describe" },
  { icon: Route, key: "shape" },
  { icon: Share2, key: "share" },
] as const;

/** The three steps from idea to shared map, in order. */
export function HowItWorks() {
  const t = useTranslations("About.how");
  return (
    <section aria-labelledby="how-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2
          id="how-title"
          className="font-display text-3xl font-medium tracking-tight"
        >
          {t("title")}
        </h2>
      </div>
      <ol className="grid gap-4 sm:grid-cols-3">
        {STEPS.map(({ icon: Icon, key }, i) => (
          <li key={key} className="frost flex flex-col gap-2 rounded-2xl p-5">
            <span className="flex items-center gap-2 text-brass-text">
              <Icon aria-hidden className="size-4" />
              <span className="eyebrow">{t("step", { number: i + 1 })}</span>
            </span>
            <h3 className="font-display text-xl font-medium text-ink">
              {t(`${key}.title`)}
            </h3>
            <p className="text-sm text-ink-soft">{t(`${key}.body`)}</p>
          </li>
        ))}
      </ol>
    </section>
  );
}
