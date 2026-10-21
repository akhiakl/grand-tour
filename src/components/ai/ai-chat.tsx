"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useTranslations } from "next-intl";
import { useState } from "react";

import { AiNotice, TermsNotice } from "@/components/legal/notices";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateTrip, type GeneratedDraft } from "@/hooks/use-generate-trip";
import { writeAiHandoff, type GenerateRequest } from "@/lib/ai";

import { ChatBubble } from "./chat-bubble";
import { DaysStep, DestinationStep, VibeStep } from "./chat-steps";

type Answers = Partial<GenerateRequest>;

function DraftingBubble() {
  const t = useTranslations("Chat");
  return (
    <ChatBubble from="atlas">
      <p className="mb-2">{t("drafting")}</p>
      <div aria-hidden className="flex w-56 flex-col gap-2">
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-4/5" />
        <Skeleton className="h-3 w-3/5" />
      </div>
    </ChatBubble>
  );
}

function FailureBubble({
  rateLimited,
  onRetry,
}: {
  readonly rateLimited: boolean;
  readonly onRetry: () => void;
}) {
  const t = useTranslations("Chat");
  return (
    <ChatBubble from="atlas">
      <p role="alert">{rateLimited ? t("rateLimited") : t("failed")}</p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="brass" onClick={onRetry}>
          <RotateCcw /> {t("retry")}
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/new">{t("byHand")}</Link>
        </Button>
      </div>
    </ChatBubble>
  );
}

/**
 * Guided three-question chat (destination → days → pace) that makes ONE
 * call to /api/generate, then lands the draft in the editor with the
 * overflow stops as ghost stops: AI drafts, the guest edits.
 */
export function AiChat({
  initialDestination,
}: {
  /** From the landing's destination search: the first question is answered. */
  readonly initialDestination?: string;
}) {
  const router = useRouter();
  const t = useTranslations("Chat");
  const vibes = useTranslations("Vibes");
  const [answers, setAnswers] = useState<Answers>({
    destination: initialDestination,
  });

  const onDrafted = (
    { trip, suggestedExtra }: GeneratedDraft,
    request: GenerateRequest,
  ) => {
    writeAiHandoff(
      { title: trip.title, cities: trip.cities, legs: trip.legs, suggestedExtra },
      request,
    );
    router.push("/new?from=ai");
  };
  const { generate, status } = useGenerateTrip({ onDrafted });

  const answer = (patch: Answers) => {
    const next = { ...answers, ...patch };
    setAnswers(next);
    if (next.destination && next.days && next.vibe) {
      void generate(next as GenerateRequest);
    }
  };

  const { destination, days, vibe } = answers;

  return (
    <div className="flex flex-col gap-4">
      <AiNotice />
      <div aria-live="polite" className="flex flex-col gap-3">
        <ChatBubble from="atlas">{t("askDestination")}</ChatBubble>
        {destination && <ChatBubble from="guest">{destination}</ChatBubble>}

        {destination && <ChatBubble from="atlas">{t("askDays")}</ChatBubble>}
        {days && <ChatBubble from="guest">{t("answerDays", { days })}</ChatBubble>}

        {days && <ChatBubble from="atlas">{t("askPace")}</ChatBubble>}
        {vibe && <ChatBubble from="guest">{vibes(`${vibe}.label`)}</ChatBubble>}

        {status === "drafting" && <DraftingBubble />}
        {(status === "rate_limited" || status === "failed") && (
          <FailureBubble
            rateLimited={status === "rate_limited"}
            onRetry={() => void generate(answers as GenerateRequest)}
          />
        )}
      </div>

      {!destination && (
        <DestinationStep onAnswer={(value) => answer({ destination: value })} />
      )}
      {destination && !days && (
        <DaysStep onAnswer={(value) => answer({ days: value })} />
      )}
      {days && !vibe && (
        <>
          <VibeStep onAnswer={(value) => answer({ vibe: value })} />
          <TermsNotice action="drafting" />
        </>
      )}
    </div>
  );
}
