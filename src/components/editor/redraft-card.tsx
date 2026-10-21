"use client";

import { Loader2, Sparkles } from "lucide-react";
import { useTranslations } from "next-intl";
import { useState, type FormEvent } from "react";

import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useGenerateTrip, type GeneratedDraft } from "@/hooks/use-generate-trip";
import { GenerateRequestSchema, VIBES, type GenerateRequest } from "@/lib/ai";
import { cn } from "@/lib/utils";

/**
 * Ask the AI for a fresh take on the route (another pace, more or fewer
 * days, a tweaked destination). The redraft replaces the stops as one
 * undoable step, so trying an idea is never destructive. Fields the
 * guest hasn't touched keep following `defaults`.
 */
export function RedraftCard({
  defaults,
  onDrafted,
}: {
  readonly defaults: GenerateRequest;
  readonly onDrafted: (draft: GeneratedDraft, request: GenerateRequest) => void;
}) {
  const t = useTranslations("Editor.redraft");
  const vibes = useTranslations("Vibes");
  // Untouched fields follow the defaults (which track the draft's stops).
  const [destinationInput, setDestinationInput] = useState<string | null>(null);
  const [daysInput, setDaysInput] = useState<string | null>(null);
  const [vibeInput, setVibeInput] = useState<GenerateRequest["vibe"] | null>(null);
  const destination = destinationInput ?? defaults.destination;
  const days = daysInput ?? String(defaults.days);
  const vibe = vibeInput ?? defaults.vibe;
  const { generate, status, reset } = useGenerateTrip({
    onDrafted: (draft, request) => {
      reset();
      onDrafted(draft, request);
    },
  });

  const request = GenerateRequestSchema.safeParse({
    destination: destination.trim(),
    days: Number(days),
    vibe,
  });
  const drafting = status === "drafting";

  const submit = (event: FormEvent) => {
    event.preventDefault();
    if (request.success && !drafting) void generate(request.data);
  };

  return (
    <Card className="gap-3 p-4">
      <form
        onSubmit={submit}
        className="flex flex-col gap-3"
        aria-label={t("eyebrow")}
      >
        <div>
          <p className="eyebrow">{t("eyebrow")}</p>
          <p className="text-xs text-ink-soft">{t("hint")}</p>
        </div>
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="redraft-destination">{t("where")}</Label>
          <Input
            id="redraft-destination"
            value={destination}
            maxLength={120}
            onChange={(e) => setDestinationInput(e.target.value)}
          />
        </div>
        <div className="flex flex-wrap items-end gap-3">
          <div className="flex w-24 flex-col gap-1.5">
            <Label htmlFor="redraft-days">{t("days")}</Label>
            <Input
              id="redraft-days"
              type="number"
              inputMode="numeric"
              min={2}
              max={30}
              value={days}
              onChange={(e) => setDaysInput(e.target.value)}
            />
          </div>
          <div
            role="radiogroup"
            aria-label={t("pace")}
            className="flex flex-1 gap-1"
          >
            {VIBES.map((option) => (
              <button
                key={option}
                type="button"
                role="radio"
                aria-checked={vibe === option}
                title={vibes(`${option}.hint`)}
                onClick={() => setVibeInput(option)}
                className={cn(
                  "h-9 flex-1 rounded-md border border-line px-2 text-xs transition-colors outline-none hover:bg-accent focus-visible:ring-2 focus-visible:ring-ring",
                  vibe === option && "border-brass bg-accent text-brass-text",
                )}
              >
                {vibes(`${option}.label`)}
              </button>
            ))}
          </div>
        </div>
        <Button
          type="submit"
          variant="outline"
          disabled={!request.success || drafting}
        >
          {drafting ? <Loader2 className="animate-spin" /> : <Sparkles />}
          {drafting ? t("drafting") : t("submit")}
        </Button>
        {(status === "rate_limited" || status === "failed") && (
          <p role="alert" className="text-xs text-destructive">
            {status === "rate_limited" ? t("rateLimited") : t("failed")}
          </p>
        )}
      </form>
    </Card>
  );
}
