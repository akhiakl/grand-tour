import { ArrowLeft, ArrowRight, PenLine, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";
import { useTranslations } from "next-intl";
import { getTranslations } from "next-intl/server";

import { AboutFaq } from "@/components/about/about-faq";
import { HowItWorks } from "@/components/about/how-it-works";
import { SiteFooter } from "@/components/legal/site-footer";
import { accent } from "@/components/rich-text";
import { RouteSketch } from "@/components/trip/route-sketch";
import { Button } from "@/components/ui/button";
import { GUEST_MAX_CITIES, SAMPLE_TRIP, tripStats } from "@/lib/trip";

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("Metadata.about");
  return { title: t("title"), description: t("description") };
}

function StartButtons() {
  const t = useTranslations("About");
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="brass" size="lg">
        <Link href="/plan">
          <Sparkles /> {t("planWithAi")}
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg">
        <Link href="/new">
          <PenLine /> {t("buildManually")}
        </Link>
      </Button>
    </div>
  );
}

function ExampleRoute() {
  const t = useTranslations("About.example");
  const stats = tripStats(SAMPLE_TRIP);
  const route = SAMPLE_TRIP.cities.map((city) => city.name).join(" → ");

  return (
    <section aria-labelledby="example-title" className="page-container">
      <div className="flex flex-col gap-4">
        <p className="eyebrow">{t("eyebrow")}</p>
        <h2
          id="example-title"
          className="font-display text-section font-medium tracking-tight text-ink"
        >
          {SAMPLE_TRIP.title}
        </h2>
      </div>
      <Link
        href="/"
        className="frost group mt-14 grid items-center gap-10 rounded-3xl p-6 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:p-10 lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:p-14"
      >
        <RouteSketch trip={SAMPLE_TRIP} className="h-auto w-full" />
        <div className="flex flex-col gap-4">
          <p className="font-display text-title text-ink">{route}</p>
          <p className="text-ink-soft">
            {t("stats", {
              cities: stats.cities,
              nights: stats.nights,
              countries: stats.countries,
            })}
          </p>
          <span className="inline-flex items-center gap-2 font-medium text-brass-text">
            {t("open")}
            <ArrowRight
              aria-hidden
              className="size-4 transition-transform group-hover:translate-x-0.5 motion-reduce:transition-none"
            />
          </span>
        </div>
      </Link>
    </section>
  );
}

export default function AboutPage() {
  const t = useTranslations("About");
  const common = useTranslations("Common");
  return (
    <div className="flex min-h-dvh flex-col">
      <nav aria-label={common("backToAtlas")} className="page-container">
        <div className="flex h-16 items-center">
          <Link
            href="/"
            className="eyebrow inline-flex items-center gap-1.5 rounded-sm text-muted-foreground transition-colors outline-none hover:text-brass-text focus-visible:ring-2 focus-visible:ring-ring"
          >
            <ArrowLeft aria-hidden className="size-3.5" /> {common("backToAtlas")}
          </Link>
        </div>
      </nav>
      <main className="flex flex-1 flex-col gap-32 pb-36 lg:gap-40">
        <header className="page-container grid items-center gap-12 py-10 lg:min-h-[calc(100dvh-4rem)] lg:grid-cols-[minmax(0,7fr)_minmax(0,5fr)] lg:gap-16 lg:py-0">
          <div className="flex flex-col gap-6">
            <h1 className="font-display text-display font-medium tracking-tight text-balance text-ink">
              {t.rich("title", { em: accent })}
            </h1>
            <p className="max-w-[44ch] text-lead text-ink-soft">{t("lede")}</p>
            <div className="pt-2">
              <StartButtons />
            </div>
          </div>
          <RouteSketch trip={SAMPLE_TRIP} className="h-auto w-full" />
        </header>

        <HowItWorks />
        <ExampleRoute />
        <AboutFaq />
      </main>

      <section aria-labelledby="start-title" className="bg-secondary">
        <div className="page-container flex flex-col gap-8 py-28 lg:flex-row lg:items-end lg:justify-between">
          <div className="flex max-w-3xl flex-col gap-4">
            <h2
              id="start-title"
              className="font-display text-section font-medium tracking-tight text-balance text-ink"
            >
              {t("start.title")}
            </h2>
            <p className="text-lead text-ink-soft">
              {t("start.body", { max: GUEST_MAX_CITIES })}
            </p>
          </div>
          <StartButtons />
        </div>
      </section>
      <SiteFooter />
    </div>
  );
}
