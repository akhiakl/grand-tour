import { TripExperience } from "@/components/trip/trip-experience";
import { SAMPLE_TRIP } from "@/lib/trip";

/**
 * Interim home: the immersive demo experience with the sample trip.
 * The full landing (CTAs, My Maps link) ships in build-order step 7.
 */
export default function Home() {
  return <TripExperience trip={SAMPLE_TRIP} />;
}
