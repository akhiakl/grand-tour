"use client";

import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import type { City } from "@/lib/trip";

import {
  FoodSection,
  ItinerarySection,
  OverviewSection,
  PlannerSection,
  PracticalSection,
} from "./drawer-sections";

const TABS = [
  { value: "overview", label: "Overview" },
  { value: "itinerary", label: "Itinerary" },
  { value: "food", label: "Food" },
  { value: "practical", label: "Practical" },
  { value: "planner", label: "Planner" },
] as const;

export function CityDrawer({
  city,
  index,
  count,
  open,
  onOpenChange,
}: {
  readonly city: City | null;
  readonly index: number;
  readonly count: number;
  readonly open: boolean;
  readonly onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="w-full gap-0 bg-paper p-0 backdrop-blur-none sm:max-w-[560px]"
      >
        {city && (
          <>
            <div
              aria-hidden
              className={`hero-grad-${index % 5} relative h-44 shrink-0 overflow-hidden`}
            >
              <span className="absolute inset-0 grid place-items-center text-[88px] drop-shadow-[0_20px_30px_rgba(0,0,0,0.25)]">
                {city.flag}
              </span>
              <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-paper" />
            </div>

            <SheetHeader className="px-7 pt-1 pb-2">
              <p className="eyebrow">
                Stop {index + 1} of {count} · {city.country}
              </p>
              <SheetTitle className="font-display text-4xl font-medium tracking-tight">
                {city.name}
              </SheetTitle>
              <SheetDescription className="flex flex-wrap gap-x-4 gap-y-1 text-[12.5px]">
                <span>
                  🛏{" "}
                  <b className="font-semibold text-foreground">
                    {city.nights} night{city.nights === 1 ? "" : "s"}
                  </b>
                </span>
                <span>
                  💶{" "}
                  <b className="font-semibold text-foreground">
                    €{city.budget[0]}–{city.budget[1]} per day
                  </b>
                </span>
              </SheetDescription>
            </SheetHeader>

            {/* Remount tabs per city so the active tab and planner reset. */}
            <Tabs key={city.name} defaultValue="overview" className="min-h-0 flex-1">
              <TabsList className="shrink-0 gap-4 px-7">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="min-h-0 flex-1 overflow-y-auto px-7 py-6">
                <TabsContent value="overview">
                  <OverviewSection city={city} />
                </TabsContent>
                <TabsContent value="itinerary">
                  <ItinerarySection city={city} />
                </TabsContent>
                <TabsContent value="food">
                  <FoodSection city={city} />
                </TabsContent>
                <TabsContent value="practical">
                  <PracticalSection city={city} />
                </TabsContent>
                <TabsContent value="planner">
                  <PlannerSection city={city} />
                </TabsContent>
              </div>
            </Tabs>
          </>
        )}
      </SheetContent>
    </Sheet>
  );
}
