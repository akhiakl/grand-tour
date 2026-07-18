"use client";

import { useState } from "react";

import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Separator } from "@/components/ui/separator";
import type { City } from "@/lib/trip";

function SectionLabel({ children }: { children: React.ReactNode }) {
  return <p className="eyebrow mb-3">{children}</p>;
}

export function OverviewSection({ city }: { city: City }) {
  return (
    <div className="space-y-6">
      <p className="text-sm leading-relaxed">{city.why}</p>
      <div>
        <SectionLabel>Must see</SectionLabel>
        <ul className="space-y-2 text-sm">
          {city.must.map((item) => (
            <li key={item} className="flex gap-2">
              <span aria-hidden className="text-brass">
                ◆
              </span>
              {item}
            </li>
          ))}
        </ul>
      </div>
      {city.gems.length > 0 && (
        <div>
          <SectionLabel>Hidden gems</SectionLabel>
          <ul className="space-y-2 text-sm text-muted-foreground">
            {city.gems.map((item) => (
              <li key={item} className="flex gap-2">
                <span aria-hidden className="text-azure">
                  ◇
                </span>
                {item}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function ItinerarySection({ city }: { city: City }) {
  return (
    <ol className="space-y-5">
      {city.days.map(([day, theme, plan]) => (
        <li key={day}>
          <div className="flex items-baseline gap-2">
            <span className="eyebrow">{day}</span>
            <span className="font-display text-base italic">{theme}</span>
          </div>
          <p className="mt-1.5 text-sm leading-relaxed text-muted-foreground">
            {plan}
          </p>
        </li>
      ))}
    </ol>
  );
}

export function FoodSection({ city }: { city: City }) {
  return (
    <ul className="space-y-4">
      {city.food.map(([dish, where]) => (
        <li key={dish}>
          <p className="font-display text-base italic">{dish}</p>
          <p className="mt-0.5 text-sm text-muted-foreground">{where}</p>
        </li>
      ))}
    </ul>
  );
}

export function PracticalSection({ city }: { city: City }) {
  const [low, high] = city.budget;
  return (
    <div className="space-y-6 text-sm">
      <div className="flex flex-wrap gap-2">
        <Badge variant="brass">
          €{low}–{high} / day
        </Badge>
        <Badge variant="outline">
          {city.nights} night{city.nights === 1 ? "" : "s"}
        </Badge>
      </div>
      <div>
        <SectionLabel>Getting around</SectionLabel>
        <p className="leading-relaxed">{city.transport}</p>
      </div>
      <div>
        <SectionLabel>Where to stay</SectionLabel>
        <p className="leading-relaxed">{city.stay}</p>
      </div>
      {city.tips.length > 0 && (
        <div>
          <SectionLabel>Good to know</SectionLabel>
          <ul className="space-y-2 text-muted-foreground">
            {city.tips.map((tip) => (
              <li key={tip} className="flex gap-2">
                <span aria-hidden className="text-brass">
                  ✦
                </span>
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

export function PlannerSection({ city }: { city: City }) {
  const items = [...city.must, ...city.gems];
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());

  const toggle = (item: string) => {
    setChecked((current) => {
      const next = new Set(current);
      if (next.has(item)) {
        next.delete(item);
      } else {
        next.add(item);
      }
      return next;
    });
  };

  return (
    <div>
      <div className="flex items-baseline justify-between">
        <SectionLabel>Checklist</SectionLabel>
        <span className="text-xs text-muted-foreground">
          {checked.size}/{items.length} planned
        </span>
      </div>
      <Separator className="mb-4" />
      <ul className="space-y-3">
        {items.map((item) => (
          <li key={item}>
            <label className="flex cursor-pointer items-center gap-3 text-sm">
              <Checkbox
                checked={checked.has(item)}
                onCheckedChange={() => toggle(item)}
              />
              <span
                className={
                  checked.has(item)
                    ? "text-muted-foreground line-through"
                    : undefined
                }
              >
                {item}
              </span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
