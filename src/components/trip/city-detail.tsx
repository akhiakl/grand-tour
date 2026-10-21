"use client";

import { useLocale, useTranslations } from "next-intl";
import { useId } from "react";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useUnits } from "@/components/units/units-provider";
import { formatDateSpan, type City, type StopDates } from "@/lib/trip";

import {
  FoodSection,
  ItinerarySection,
  OverviewSection,
  PlannerSection,
  PracticalSection,
} from "./drawer-sections";
import { BackToRoute } from "./trip-tools";

const TABS = ["overview", "itinerary", "food", "practical", "planner"] as const;

/** One stop in depth, shown in the panel in place of the itinerary. */
export function CityDetail({
  city,
  index,
  count,
  dates,
  onBack,
}: {
  readonly city: City;
  readonly index: number;
  readonly count: number;
  /** This stop's stay, for dated trips. */
  readonly dates?: StopDates;
  readonly onBack: () => void;
}) {
  const t = useTranslations("Trip");
  const locale = useLocale();
  const titleId = useId();
  const { money } = useUnits();

  return (
    <article aria-labelledby={titleId} className="flex flex-col gap-4">
      <BackToRoute onBack={onBack} />

      <div className="flex items-center gap-4">
        <span
          aria-hidden
          className={`hero-grad-${index % 5} grid size-16 shrink-0 place-items-center rounded-2xl text-4xl`}
        >
          {city.flag}
        </span>
        <div className="min-w-0">
          <p className="eyebrow">
            {t("city.stopOf", { number: index + 1, count, country: city.country })}
          </p>
          <h2
            id={titleId}
            title={city.name}
            className="truncate font-display text-3xl font-medium tracking-tight"
          >
            {city.name}
          </h2>
          <p className="flex flex-wrap gap-x-4 text-[12.5px] text-ink-soft">
            <span>
              🛏{" "}
              <b className="font-semibold text-ink">
                {t("nights", { count: city.nights })}
              </b>
            </span>
            {dates && (
              <span>
                📅{" "}
                <b className="font-semibold text-ink">
                  {formatDateSpan(dates, locale)}
                </b>
              </span>
            )}
            <span>
              💰{" "}
              <b className="font-semibold text-ink">
                {t("perDay", { amount: money(city.budget) })}
              </b>
            </span>
          </p>
        </div>
      </div>

      {/* Remount tabs per city so the active tab and planner reset. */}
      <Tabs key={`${city.name}-${index}`} defaultValue="overview">
        <TabsList className="w-full justify-between gap-2">
          {TABS.map((tab) => (
            <TabsTrigger key={tab} value={tab}>
              {t(`city.tabs.${tab}`)}
            </TabsTrigger>
          ))}
        </TabsList>
        <div className="pt-5">
          <TabsContent value="overview">
            <OverviewSection city={city} />
          </TabsContent>
          <TabsContent value="itinerary">
            <ItinerarySection city={city} />
          </TabsContent>
          <TabsContent value="food">
            <FoodSection city={city} />
          </TabsContent>
          <TabsContent value="practical">
            <PracticalSection city={city} />
          </TabsContent>
          <TabsContent value="planner">
            <PlannerSection city={city} />
          </TabsContent>
        </div>
      </Tabs>
    </article>
  );
}
