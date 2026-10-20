import { ChevronRight } from "lucide-react";
import { Fragment } from "react";

import { useUnits } from "@/components/units/units-provider";
import { tripStats, type Leg, type Trip } from "@/lib/trip";
import { cn } from "@/lib/utils";

import { MODE_META } from "./mode";

function Stat({
  value,
  detail,
  caption,
}: {
  readonly value: string | number;
  readonly detail?: string;
  readonly caption: string;
}) {
  return (
    <div className="min-w-0 rounded-xl border border-line px-3.5 py-2.5">
      <b className="block font-display text-lg leading-tight font-medium wrap-break-word">
        {value}
        {detail && (
          <span className="ml-1.5 inline-block font-sans text-xs font-normal text-ink-soft">
            {detail}
          </span>
        )}
      </b>
      <span className="block text-[10px] tracking-[0.16em] text-ink-soft uppercase wrap-break-word">
        {caption}
      </span>
    </div>
  );
}

export function StatsGrid({ trip }: { readonly trip: Trip }) {
  const stats = tripStats(trip);
  const { money, distance } = useUnits();

  return (
    <div className="grid grid-cols-2 gap-2">
      <Stat value={stats.nights} caption="Nights" />
      <Stat
        value={stats.cities}
        detail={`in ${stats.countries} countr${stats.countries === 1 ? "y" : "ies"}`}
        caption="Cities"
      />
      <Stat value={distance(stats.totalKm)} caption="Total route" />
      <Stat value={money(stats.budget)} caption="Budget / person" />
    </div>
  );
}

function LegLine({ leg }: { readonly leg: Leg }) {
  const { emoji, label } = MODE_META[leg.mode];
  return (
    <li
      aria-label={`${label}, ${leg.duration}`}
      className="ml-[23px] flex items-center gap-2 border-l-2 border-dashed border-brass/50 py-2 pl-[21px] text-xs text-ink-soft"
    >
      <span aria-hidden>{emoji}</span>
      <span aria-hidden>
        {label} · {leg.duration}
      </span>
    </li>
  );
}

/**
 * The route as a vertical, scrollable itinerary; each stop opens its
 * detail. Hovering or focusing a row reports it (`onHover`) so the map can
 * highlight its marker, and `hoveredIndex` lights the row back up when
 * the pointer is on that marker instead.
 */
export function Itinerary({
  trip,
  selectedIndex,
  onSelect,
  hoveredIndex = null,
  onHover,
}: {
  readonly trip: Trip;
  readonly selectedIndex: number | null;
  readonly onSelect: (index: number) => void;
  readonly hoveredIndex?: number | null;
  readonly onHover?: (index: number | null) => void;
}) {
  return (
    <ol aria-label="Itinerary">
      {trip.cities.map((city, index) => (
        <Fragment key={`${city.name}-${index}`}>
          {index > 0 && <LegLine leg={trip.legs[index - 1]} />}
          <li>
            <button
              type="button"
              onClick={() => onSelect(index)}
              onPointerEnter={() => onHover?.(index)}
              onPointerLeave={() => onHover?.(null)}
              onFocus={() => onHover?.(index)}
              onBlur={() => onHover?.(null)}
              aria-current={selectedIndex === index ? "step" : undefined}
              data-hovered={hoveredIndex === index || undefined}
              className={cn(
                "group flex w-full items-center gap-3 rounded-xl p-1.5 text-left transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring data-hovered:bg-accent",
                selectedIndex === index && "bg-accent",
              )}
            >
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-full border border-line bg-card-solid text-lg"
              >
                {city.flag}
              </span>
              <span className="min-w-0 flex-1">
                <span
                  title={city.name}
                  className="block truncate font-display text-base font-medium"
                >
                  {city.name}
                </span>
                <span className="block text-xs text-ink-soft">
                  {city.nights} night{city.nights === 1 ? "" : "s"} · {city.country}
                </span>
              </span>
              <ChevronRight
                aria-hidden
                className="size-4 text-ink-soft transition-transform group-hover:translate-x-0.5"
              />
            </button>
          </li>
        </Fragment>
      ))}
    </ol>
  );
}
