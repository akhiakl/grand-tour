import { ThemeToggle } from "@/components/theme-toggle";
import { TripExperience } from "@/components/trip/trip-experience";
import { SAMPLE_TRIP } from "@/lib/trip";

/**
 * Interim home: the live demo map with the sample Grand Tour trip.
 * The full landing experience (CTAs, hero) ships in build-order step 7.
 */
export default function Home() {
  return (
    <main className="mx-auto flex w-full max-w-6xl flex-1 flex-col gap-5 p-4 sm:p-6">
      <header className="flex items-end justify-between gap-4">
        <div>
          <p className="eyebrow">Field Atlas</p>
          <h1 className="mt-2 font-display text-4xl font-medium tracking-tight">
            Grand Tour
          </h1>
          <p className="mt-2 max-w-md text-sm leading-relaxed text-muted-foreground">
            Five stops, one brass line across Europe — tap a city on the map or the
            rail below to open its field notes.
          </p>
        </div>
        <ThemeToggle />
      </header>

      <TripExperience trip={SAMPLE_TRIP} className="flex-1" />
    </main>
  );
}
