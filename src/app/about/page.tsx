import { ArrowLeft, ArrowRight, PenLine, Sparkles } from "lucide-react";
import type { Metadata } from "next";
import Link from "next/link";

import { AboutFaq } from "@/components/about/about-faq";
import { HowItWorks } from "@/components/about/how-it-works";
import { SiteFooter } from "@/components/legal/site-footer";
import { RouteSketch } from "@/components/trip/route-sketch";
import { Button } from "@/components/ui/button";
import { GUEST_MAX_CITIES, SAMPLE_TRIP, tripStats } from "@/lib/trip";

export const metadata: Metadata = {
  title: "How it works",
  description:
    "Draw a travel route with AI or by hand, shape every leg, and share it as one link. Free, no account needed.",
};

function StartButtons() {
  return (
    <div className="flex flex-wrap gap-2">
      <Button asChild variant="brass" size="lg">
        <Link href="/plan">
          <Sparkles /> Plan with AI
        </Link>
      </Button>
      <Button asChild variant="outline" size="lg">
        <Link href="/new">
          <PenLine /> Build manually
        </Link>
      </Button>
    </div>
  );
}

function ExampleRoute() {
  const stats = tripStats(SAMPLE_TRIP);
  const route = SAMPLE_TRIP.cities.map((city) => city.name).join(" → ");

  return (
    <section aria-labelledby="example-title" className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <p className="eyebrow">An example route</p>
        <h2
          id="example-title"
          className="font-display text-3xl font-medium tracking-tight"
        >
          {SAMPLE_TRIP.title}
        </h2>
      </div>
      <Link
        href="/"
        className="frost group grid items-center gap-4 rounded-3xl p-5 outline-none focus-visible:ring-2 focus-visible:ring-ring sm:grid-cols-[minmax(0,1fr)_minmax(0,1.2fr)]"
      >
        <RouteSketch trip={SAMPLE_TRIP} className="w-full" />
        <div className="flex flex-col gap-3">
          <p className="text-ink">{route}</p>
          <p className="text-sm text-ink-soft">
            {stats.cities} stops · {stats.nights} nights · {stats.countries}{" "}
            countries
          </p>
          <span className="inline-flex items-center gap-1 text-sm font-medium text-brass-text">
            Open the live map
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
  return (
    <div className="flex min-h-dvh flex-col">
      <main className="mx-auto flex w-full max-w-5xl flex-1 flex-col gap-20 px-4 py-10 sm:px-6 lg:py-16">
        <header className="grid items-center gap-8 lg:grid-cols-[minmax(0,1.1fr)_minmax(0,1fr)]">
          <div className="flex flex-col gap-4">
            <Link
              href="/"
              className="eyebrow inline-flex w-fit items-center gap-1 text-muted-foreground transition-colors hover:text-brass-text"
            >
              <ArrowLeft className="size-3" /> Field Atlas
            </Link>
            <p className="eyebrow">Field notes</p>
            <h1 className="font-display text-4xl font-medium tracking-tight text-balance text-ink sm:text-5xl">
              Every journey deserves a map{" "}
              <em className="text-azure">worth sharing</em>
            </h1>
            <p className="max-w-prose text-lg text-ink-soft">
              Grand Tour turns a trip idea into an interactive route map: cities,
              nights, trains and flights, drawn by AI or by hand. Free, and no
              account needed.
            </p>
            <StartButtons />
          </div>
          <RouteSketch
            trip={SAMPLE_TRIP}
            className="w-full max-w-lg justify-self-center"
          />
        </header>

        <HowItWorks />
        <ExampleRoute />
        <AboutFaq />

        <section
          aria-labelledby="start-title"
          className="frost flex flex-col items-start gap-4 rounded-3xl p-8"
        >
          <h2
            id="start-title"
            className="font-display text-3xl font-medium tracking-tight"
          >
            Your next grand tour starts here
          </h2>
          <p className="text-ink-soft">
            Up to {GUEST_MAX_CITIES} stops, one link, no account.
          </p>
          <StartButtons />
        </section>
      </main>
      <SiteFooter />
    </div>
  );
}
