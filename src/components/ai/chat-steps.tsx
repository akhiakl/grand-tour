"use client";

import { ArrowRight } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VIBES, type GenerateRequest } from "@/lib/ai";

type Vibe = GenerateRequest["vibe"];

const MIN_DAYS = 2;
const MAX_DAYS = 30;

/** Free-text destination ("Austria", "the Amalfi coast", ...). */
export function DestinationStep({
  onAnswer,
}: {
  readonly onAnswer: (value: string) => void;
}) {
  const t = useTranslations("Chat");
  const [value, setValue] = useState("");
  const trimmed = value.trim();

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (trimmed.length >= 2) onAnswer(trimmed);
  };

  return (
    <form onSubmit={submit} className="flex gap-2">
      <Input
        autoFocus
        name="destination"
        aria-label={t("destinationLabel")}
        placeholder={t("destinationPlaceholder")}
        maxLength={120}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="submit" variant="brass" disabled={trimmed.length < 2}>
        {t("next")} <ArrowRight />
      </Button>
    </form>
  );
}

/** Trip length, clamped to the generator's 2–30 day contract. */
export function DaysStep({
  onAnswer,
}: {
  readonly onAnswer: (value: number) => void;
}) {
  const t = useTranslations("Chat");
  const [value, setValue] = useState("7");
  const days = Number(value);
  const valid = Number.isInteger(days) && days >= MIN_DAYS && days <= MAX_DAYS;

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (valid) onAnswer(days);
  };

  return (
    <form onSubmit={submit} className="flex items-center gap-2">
      <Input
        autoFocus
        name="days"
        aria-label={t("daysLabel")}
        type="number"
        inputMode="numeric"
        min={MIN_DAYS}
        max={MAX_DAYS}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-28"
      />
      <span className="text-sm text-ink-soft">{t("daysUnit")}</span>
      <Button type="submit" variant="brass" disabled={!valid} className="ml-auto">
        {t("next")} <ArrowRight />
      </Button>
    </form>
  );
}

/** Pace picker; choosing one sends the request. */
export function VibeStep({
  onAnswer,
}: {
  readonly onAnswer: (value: Vibe) => void;
}) {
  const t = useTranslations("Chat");
  const vibes = useTranslations("Vibes");
  return (
    <fieldset className="grid gap-2 sm:grid-cols-3">
      <legend className="sr-only">{t("paceLabel")}</legend>
      {VIBES.map((vibe, i) => (
        <button
          key={vibe}
          type="button"
          autoFocus={i === 0}
          onClick={() => onAnswer(vibe)}
          className="frost flex flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left transition-colors hover:border-brass focus-visible:border-brass focus-visible:outline-none"
        >
          <span className="font-display text-base font-medium text-ink">
            {vibes(`${vibe}.label`)}
          </span>
          <span className="text-xs text-ink-soft">{vibes(`${vibe}.hint`)}</span>
        </button>
      ))}
    </fieldset>
  );
}
