"use client";

import { UtensilsCrossed } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { highlight } from "@/components/rich-text";
import { Checkbox } from "@/components/ui/checkbox";
import { useUnits } from "@/components/units/units-provider";
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
        gem && "border-brass/45 text-brass-text",
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
  readonly lead: React.ReactNode;
  readonly title: string;
  readonly body: string;
}) {
  return (
    <div className="flex gap-3.5 border-b border-dashed border-line py-3">
      <div className="w-14 shrink-0 pt-0.5 font-display text-[13px] font-semibold text-brass-text">
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
  const t = useTranslations("Trip.city");
  return (
    <div className="space-y-7">
      <div>
        <SectionHeading>{t("whyVisit")}</SectionHeading>
        <p className="text-sm leading-relaxed text-muted-foreground">{city.why}</p>
      </div>
      <div>
        <SectionHeading>{t("mustSee")}</SectionHeading>
        <div className="flex flex-wrap gap-2">
          {city.must.map((item) => (
            <Pill key={item}>{item}</Pill>
          ))}
        </div>
      </div>
      {city.gems.length > 0 && (
        <div>
          <SectionHeading>{t("hiddenGems")}</SectionHeading>
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
  const t = useTranslations("Trip.city");
  return (
    <div>
      <SectionHeading>{t("dayByDay")}</SectionHeading>
      {city.days.map(([day, theme, plan]) => (
        <DayRow key={day} lead={day} title={theme} body={plan} />
      ))}
    </div>
  );
}

export function FoodSection({ city }: { readonly city: City }) {
  const t = useTranslations("Trip.city");
  return (
    <div>
      <SectionHeading>{t("eatLocal")}</SectionHeading>
      {city.food.map(([dish, where]) => (
        <DayRow
          key={dish}
          lead={<UtensilsCrossed aria-hidden className="size-4" />}
          title={dish}
          body={where}
        />
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
      <div className="mb-1 text-xs text-muted-foreground">{label}</div>
      <div className="text-sm leading-snug font-medium">{value}</div>
    </div>
  );
}

export function PracticalSection({ city }: { readonly city: City }) {
  const t = useTranslations("Trip");
  const { money } = useUnits();
  return (
    <div className="space-y-7">
      <div className="grid grid-cols-2 gap-2.5">
        <InfoCard
          label={t("city.dailyBudget")}
          value={t("perPerson", { amount: money(city.budget) })}
        />
        <InfoCard label={t("city.gettingAround")} value={city.transport} />
        <InfoCard label={t("city.whereToStay")} value={city.stay} wide />
      </div>
      {city.tips.length > 0 && (
        <div>
          <SectionHeading>{t("city.localTips")}</SectionHeading>
          <ul className="list-disc pl-4 marker:text-brass-text">
            {city.tips.map((tip) => (
              <li
                key={tip}
                className="py-1.5 text-[13.5px] leading-relaxed text-muted-foreground"
              >
                {tip}
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}

const SPEND_STYLES = ["backpacker", "comfortable", "indulgent"] as const;

function spendStyleIndex(spend: number) {
  if (spend < 33) return 0;
  if (spend < 67) return 1;
  return 2;
}

export function PlannerSection({ city }: { readonly city: City }) {
  const items = [...city.must, ...city.gems];
  const [checked, setChecked] = useState<ReadonlySet<string>>(new Set());
  const [spend, setSpend] = useState(50);
  const { money } = useUnits();
  const t = useTranslations("Trip.city");

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
        <SectionHeading>{t("budgetCalculator")}</SectionHeading>
        <div className="rounded-2xl border border-line bg-card p-4">
          <label
            htmlFor="spend-style"
            className="mb-1.5 block text-xs text-muted-foreground"
          >
            {t.rich("spendingStyle", {
              style: t(`spendStyles.${spendStyle}`),
              b: highlight,
            })}
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
            {money(perDay * city.nights)}{" "}
            <span className="font-sans text-[13px] font-normal text-muted-foreground">
              {t("budgetTotal", { perDay: money(perDay), nights: city.nights })}
            </span>
          </p>
        </div>
      </div>

      <div>
        <div className="flex items-baseline justify-between">
          <SectionHeading>{t("checklist")}</SectionHeading>
          <span className="text-xs text-muted-foreground">
            {t("planned", { done: checked.size, total: items.length })}
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
