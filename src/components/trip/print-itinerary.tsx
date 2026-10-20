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
  const facts = [
    dates && formatDateSpan(dates),
    `${city.nights} night${city.nights === 1 ? "" : "s"}`,
    `${money(city.budget)} per day`,
  ].filter(Boolean);

  return (
    <section className="break-inside-avoid-page space-y-3 border-t border-line pt-4">
      <header>
        <p className="eyebrow">
          Stop {index + 1} · {city.country}
        </p>
        <h3 className="font-display text-[18pt] leading-tight font-medium">
          {city.flag} {city.name}
        </h3>
        <p className="text-[10pt] text-ink-soft">{facts.join(" · ")}</p>
      </header>
      {city.why && <p className="text-[10.5pt] leading-relaxed">{city.why}</p>}
      {city.days.length > 0 && (
        <div>
          <h4 className="eyebrow mb-1">Day by day</h4>
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
        <PrintList title="Must see" items={city.must} />
        <PrintList title="Hidden gems" items={city.gems} />
        <PrintList
          title="Eat"
          items={city.food.map(([dish, note]) => `${dish}: ${note}`)}
        />
        <PrintList title="Tips" items={city.tips} />
      </div>
      {(city.stay || city.transport) && (
        <p className="text-[10pt] text-ink-soft">
          {city.stay && <>Stay: {city.stay}. </>}
          {city.transport && <>Getting around: {city.transport}.</>}
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

  return (
    <article className="hidden space-y-5 bg-paper text-ink print:block">
      <header className="space-y-1">
        <p className="eyebrow">Grand Tour itinerary</p>
        <h1 className="font-display text-[28pt] leading-tight font-medium">
          {trip.title}
        </h1>
        <p className="text-[10.5pt] text-ink-soft">
          {[
            range && formatDateSpan(range),
            `${stats.nights} nights`,
            `${stats.cities} cities in ${stats.countries} countr${stats.countries === 1 ? "y" : "ies"}`,
            distance(stats.totalKm),
            `${money(stats.budget)} per person`,
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
                MODE_META[trip.legs[index - 1].mode].label,
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
