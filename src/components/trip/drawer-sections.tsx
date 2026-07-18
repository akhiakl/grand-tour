"use client";

import { useState } from "react";

import { Checkbox } from "@/components/ui/checkbox";
import type { City } from "@/lib/trip";
import { cn } from "@/lib/utils";

function SectionHeading({ children }: { readonly children: React.ReactNode }) {
  return <h3 className="mb-2.5 font-display text-lg font-medium">{children}</h3>;
}

function Pill({
  children,
  gem = false,
}: {
  readonly children: React.ReactNode;
  readonly gem?: boolean;
}) {
  return (
    <span
      className={cn(
        "rounded-full border border-line bg-card px-3 py-1.5 text-[12.5px] font-medium",
        gem && "border-brass/45 text-brass",
      )}
    >
      {children}
    </span>
  );
}

function DayRow({
  lead,
  title,
  body,
}: {
  readonly lead: string;
  readonly title: string;
  readonly body: string;
}) {
  return (
    <div className="flex gap-3.5 border-b border-dashed border-line py-3">
      <div className="w-14 shrink-0 pt-0.5 font-display text-[13px] font-semibold text-brass">
        {lead}
      </div>
      <div>
        <b className="mb-0.5 block text-sm">{title}</b>
        <span className="text-[13px] leading-relaxed text-muted-foreground">
          {body}
        </span>
      </div>
    </div>
  );
}

export function OverviewSection({ city }: { readonly city: City }) {
  return (
    <div className="space-y-7">
      <div>
        <SectionHeading>Why visit</SectionHeading>
        <p className="text-sm leading-relaxed text-muted-foreground">{city.why}</p>
      </div>
      <div>
        <SectionHeading>Must see</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {city.must.map((item) => (
            <Pill key={item}>{item}</Pill>
          ))}
        </div>
      </div>
      {city.gems.length > 0 && (
        <div>
          <SectionHeading>Hidden gems</SectionHeading>
          <div className="flex flex-wrap gap-2">
            {city.gems.map((item) => (
              <Pill key={item} gem>
                ◆ {item}
              </Pill>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

export function ItinerarySection({ city }: { readonly city: City }) {
  return (
    <div>
      <SectionHeading>Day by day</SectionHeading>
      {city.days.map(([day, theme, plan]) => (
        <DayRow key={day} lead={day} title={theme} body={plan} />
      ))}
    </div>
  );
}

export function FoodSection({ city }: { readonly city: City }) {
  return (
    <div>
      <SectionHeading>Eat like a local</SectionHeading>
      {city.food.map(([dish, where]) => (
        <DayRow key={dish} lead="🍽" title={dish} body={where} />
      ))}
    </div>
  );
}

function InfoCard({
  label,
  value,
  wide = false,
}: {
  readonly label: string;
  readonly value: string;
  readonly wide?: boolean;
}) {
  return (
    <div
      className={cn(
        "rounded-xl border border-line bg-card p-3.5",
        wide && "col-span-full",
      )}
    >
      <div className="mb-1 text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {label}
      </div>
      <div className="text-sm leading-snug font-medium">{value}</div>
    </div>
  );
}

export function PracticalSection({ city }: { readonly city: City }) {
  const [low, high] = city.budget;
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 gap-2.5">
        <InfoCard label="Daily budget" value={`€${low}–${high} per person`} />
        <InfoCard label="Getting around" value={city.transport} />
        <InfoCard label="Where to stay" value={city.stay} wide />
      </div>
      {city.tips.length > 0 && (
        <div>
          <SectionHeading>Local tips</SectionHeading>
          {city.tips.map((tip) => (
            <p
              key={tip}
              className="flex gap-2.5 py-1.5 text-[13.5px] leading-relaxed text-muted-foreground"
            >
              <span aria-hidden className="shrink-0 text-brass">
                —
              </span>
              {tip}
            </p>
          ))}
        </div>
      )}
    </div>
  );
}

const SPEND_STYLES = ["Backpacker", "Comfortable", "Indulgent"] as const;

function spendStyleIndex(spend: number) {
  if (spend < 33) return 0;
  if (spend < 67) return 1;
  return 2;
}

export function PlannerSection({ city }: { readonly city: City }) {
  const items = [...city.must, ...city.gems];
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [spend, setSpend] = useState(50);

  const [low, high] = city.budget;
  const perDay = Math.round(low + ((high - low) * spend) / 100);
  const spendStyle = SPEND_STYLES[spendStyleIndex(spend)];

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
    <div className="space-y-7">
      <div>
        <SectionHeading>Budget calculator</SectionHeading>
        <div className="rounded-2xl border border-line bg-card p-4">
          <label
            htmlFor="spend-style"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            Spending style —{" "}
            <b className="font-semibold text-foreground">{spendStyle}</b>
          </label>
          <input
            id="spend-style"
            type="range"
            min={0}
            max={100}
            value={spend}
            onChange={(event) => setSpend(Number(event.target.value))}
            className="w-full"
          />
          <p className="mt-2 font-display text-2xl font-medium">
            €{perDay * city.nights}{" "}
            <span className="font-sans text-[13px] font-normal text-muted-foreground">
              total · €{perDay}/day × {city.nights} night
              {city.nights === 1 ? "" : "s"}
            </span>
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <SectionHeading>Attraction checklist</SectionHeading>
          <span className="text-xs text-muted-foreground">
            {checked.size}/{items.length} planned
          </span>
        </div>
        <ul>
          {items.map((item, index) => {
            const id = `attraction-${index}`;
            return (
              <li key={item} className="border-b border-dashed border-line">
                <div className="flex items-center gap-3 py-2 text-sm">
                  <Checkbox
                    id={id}
                    checked={checked.has(item)}
                    onCheckedChange={() => toggle(item)}
                  />
                  <label
                    htmlFor={id}
                    className={cn(
                      "cursor-pointer",
                      checked.has(item) && "text-muted-foreground line-through",
                    )}
                  >
                    {item}
                  </label>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    </div>
  );
}
