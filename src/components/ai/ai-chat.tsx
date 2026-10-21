"use client";

import { RotateCcw } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { AiNotice, TermsNotice } from "@/components/legal/notices";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import { useGenerateTrip, type GeneratedDraft } from "@/hooks/use-generate-trip";
import { writeAiHandoff, type GenerateRequest } from "@/lib/ai";

import { ChatBubble } from "./chat-bubble";
import { DaysStep, DestinationStep, VIBE_COPY, VibeStep } from "./chat-steps";

type Answers = Partial<GenerateRequest>;

function DraftingBubble() {
  return (
    <ChatBubble from="atlas">
      <p className="mb-2">Drafting your route…</p>
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
  return (
    <ChatBubble from="atlas">
      <p role="alert">
        {rateLimited
          ? "The atlas needs a breather. Too many drafts in a short while; give it a minute and try again."
          : "That route didn't come together. Try once more, or start from a blank page."}
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <Button type="button" size="sm" variant="brass" onClick={onRetry}>
          <RotateCcw /> Try again
        </Button>
        <Button asChild size="sm" variant="outline">
          <Link href="/new">Build it by hand</Link>
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
export function AiChat() {
  const router = useRouter();
  const [answers, setAnswers] = useState<Answers>({});

  const onDrafted = ({ trip, suggestedExtra }: GeneratedDraft) => {
    writeAiHandoff({
      title: trip.title,
      cities: trip.cities,
      legs: trip.legs,
      suggestedExtra,
    });
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
        <ChatBubble from="atlas">
          Where should this journey go? A country, a region, or a string of cities
          all work.
        </ChatBubble>
        {destination && <ChatBubble from="guest">{destination}</ChatBubble>}

        {destination && (
          <ChatBubble from="atlas">
            How many days do you have, from 2 to 30?
          </ChatBubble>
        )}
        {days && <ChatBubble from="guest">{days} days</ChatBubble>}

        {days && <ChatBubble from="atlas">And the pace?</ChatBubble>}
        {vibe && <ChatBubble from="guest">{VIBE_COPY[vibe].label}</ChatBubble>}

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
          <TermsNotice action="choosing a pace and drafting a route" />
        </>
      )}
    </div>
  );
}
