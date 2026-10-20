import { useLocale, useTranslations } from "next-intl";
import { Fragment } from "react";

import { useUnits } from "@/components/units/units-provider";
import {
  formatDateSpan,
  stopDates,
  tripDateRange,
  tripStats,
  type City,
  type StopDates,
  type Trip,
} from "@/lib/trip";

import { MODE_META } from "./mode";

function PrintList({
  title,
  items,
}: {
  readonly title: string;
  readonly items: string[];
}) {
  if (items.length === 0) return null;
  return (
    <div>
      <h4 className="eyebrow mb-1">{title}</h4>
      <ul className="list-disc space-y-0.5 pl-4 text-[10.5pt]">
        {items.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>
    </div>
  );
}

function PrintStop({
  city,
  index,
  dates,
}: {
  readonly city: City;
  readonly index: number;
  readonly dates?: StopDates;
}) {
  const { money } = useUnits();
  const t = useTranslations("Trip");
  const locale = useLocale();
  const facts = [
    dates && formatDateSpan(dates, locale),
    t("nights", { count: city.nights }),
    t("perDay", { amount: money(city.budget) }),
  ].filter(Boolean);

  return (
    <section className="break-inside-avoid-page space-y-3 border-t border-line pt-4">
      <header>
        <p className="eyebrow">
          {t("print.stop", { number: index + 1, country: city.country })}
        </p>
        <h3 className="font-display text-[18pt] leading-tight font-medium">
          {city.flag} {city.name}
        </h3>
        <p className="text-[10pt] text-ink-soft">{facts.join(" · ")}</p>
      </header>
      {city.why && <p className="text-[10.5pt] leading-relaxed">{city.why}</p>}
      {city.days.length > 0 && (
        <div>
          <h4 className="eyebrow mb-1">{t("print.dayByDay")}</h4>
          <dl className="space-y-1 text-[10.5pt]">
            {city.days.map(([lead, title, body]) => (
              <div key={`${lead}-${title}`} className="flex gap-3">
                <dt className="w-14 shrink-0 font-semibold text-brass-text">
                  {lead}
                </dt>
                <dd>
                  <b>{title}</b>
                  {body && ` · ${body}`}
                </dd>
              </div>
            ))}
          </dl>
        </div>
      )}
      <div className="grid grid-cols-2 gap-4">
        <PrintList title={t("print.mustSee")} items={city.must} />
        <PrintList title={t("print.hiddenGems")} items={city.gems} />
        <PrintList
          title={t("print.eat")}
          items={city.food.map(([dish, note]) => `${dish}: ${note}`)}
        />
        <PrintList title={t("print.tips")} items={city.tips} />
      </div>
      {(city.stay || city.transport) && (
        <p className="text-[10pt] text-ink-soft">
          {city.stay && <>{t("print.stay", { stay: city.stay })} </>}
          {city.transport && t("print.gettingAround", { transport: city.transport })}
        </p>
      )}
    </section>
  );
}

/**
 * The trip as a printable document: hidden on screen, it replaces the
 * interactive map view when the page is printed (see the print rules in
 * globals.css). Everything a traveller needs on paper, nothing interactive.
 */
export function PrintItinerary({ trip }: { readonly trip: Trip }) {
  const stats = tripStats(trip);
  const range = tripDateRange(trip);
  const dates = stopDates(trip);
  const { money, distance } = useUnits();
  const t = useTranslations("Trip");
  const modes = useTranslations("Modes");
  const locale = useLocale();

  return (
    <article className="hidden space-y-5 bg-paper text-ink print:block">
      <header className="space-y-1">
        <p className="eyebrow">{t("print.eyebrow")}</p>
        <h1 className="font-display text-[28pt] leading-tight font-medium">
          {trip.title}
        </h1>
        <p className="text-[10.5pt] text-ink-soft">
          {[
            range && formatDateSpan(range, locale),
            t("summary", {
              nights: stats.nights,
              cities: stats.cities,
              countries: stats.countries,
            }),
            distance(stats.totalKm),
            t("perPerson", { amount: money(stats.budget) }),
          ]
            .filter(Boolean)
            .join(" · ")}
        </p>
      </header>
      {trip.cities.map((city, index) => (
        <Fragment key={`${city.name}-${index}`}>
          {index > 0 && (
            <p className="text-[10pt] text-ink-soft">
              {MODE_META[trip.legs[index - 1].mode].emoji}{" "}
              {[
                modes(trip.legs[index - 1].mode),
                trip.legs[index - 1].label,
                trip.legs[index - 1].duration,
              ]
                .filter(Boolean)
                .join(" · ")}
            </p>
          )}
          <PrintStop city={city} index={index} dates={dates?.[index]} />
        </Fragment>
      ))}
    </article>
  );
}
