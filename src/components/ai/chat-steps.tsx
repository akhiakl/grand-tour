"use client";

import { ArrowRight } from "lucide-react";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { VIBES, type GenerateRequest } from "@/lib/ai";

type Vibe = GenerateRequest["vibe"];

export const VIBE_COPY: Record<Vibe, { label: string; hint: string }> = {
  relaxed: { label: "Relaxed", hint: "Fewer stops, long lunches" },
  balanced: { label: "Balanced", hint: "A steady rhythm" },
  packed: { label: "Packed", hint: "See as much as possible" },
};

const MIN_DAYS = 2;
const MAX_DAYS = 30;

/** Free-text destination ("Austria", "the Amalfi coast", ...). */
export function DestinationStep({
  onAnswer,
}: {
  readonly onAnswer: (value: string) => void;
}) {
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
        aria-label="Destination"
        placeholder="Austria, the Dalmatian coast, Kyoto and around…"
        maxLength={120}
        value={value}
        onChange={(e) => setValue(e.target.value)}
      />
      <Button type="submit" variant="brass" disabled={trimmed.length < 2}>
        Next <ArrowRight />
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
        aria-label="Number of days"
        type="number"
        inputMode="numeric"
        min={MIN_DAYS}
        max={MAX_DAYS}
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-28"
      />
      <span className="text-sm text-ink-soft">days</span>
      <Button type="submit" variant="brass" disabled={!valid} className="ml-auto">
        Next <ArrowRight />
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
  return (
    <div role="group" aria-label="Pace" className="grid gap-2 sm:grid-cols-3">
      {VIBES.map((vibe, i) => (
        <button
          key={vibe}
          type="button"
          autoFocus={i === 0}
          onClick={() => onAnswer(vibe)}
          className="frost flex flex-col items-start gap-1 rounded-2xl px-4 py-3 text-left transition-colors hover:border-brass focus-visible:border-brass focus-visible:outline-none"
        >
          <span className="font-display text-base font-medium text-ink">
            {VIBE_COPY[vibe].label}
          </span>
          <span className="text-xs text-ink-soft">{VIBE_COPY[vibe].hint}</span>
        </button>
      ))}
    </div>
  );
}
