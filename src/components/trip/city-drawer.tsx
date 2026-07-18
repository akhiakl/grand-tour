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
  city: City | null;
  index: number;
  count: number;
  open: boolean;
  onOpenChange: (open: boolean) => void;
}) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full gap-0 p-0 sm:max-w-md">
        {city && (
          <>
            <SheetHeader className="border-b border-line p-6 pb-4">
              <p className="eyebrow">
                Stop {index + 1} of {count} · {city.country}{" "}
                <span aria-hidden>{city.flag}</span>
              </p>
              <SheetTitle className="font-display text-3xl font-medium tracking-tight">
                {city.name}
              </SheetTitle>
              <SheetDescription>
                {city.nights} night{city.nights === 1 ? "" : "s"} · €{city.budget[0]}
                –{city.budget[1]} per day
              </SheetDescription>
            </SheetHeader>

            {/* Remount tabs per city so the active tab and planner reset. */}
            <Tabs key={city.name} defaultValue="overview" className="min-h-0 flex-1">
              <TabsList className="shrink-0 px-6 pt-4">
                {TABS.map((tab) => (
                  <TabsTrigger key={tab.value} value={tab.value}>
                    {tab.label}
                  </TabsTrigger>
                ))}
              </TabsList>
              <div className="min-h-0 flex-1 overflow-y-auto p-6">
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
