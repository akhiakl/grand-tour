import { LandingCta } from "@/components/landing/landing-cta";
import { TripExperience } from "@/components/trip/trip-experience";
import { SAMPLE_TRIP } from "@/lib/trip";

/**
 * The landing: the immersive demo experience with the sample trip, plus a
 * floating CTA card into every journey (AI chat, manual editor, My Maps).
 */
export default function Home() {
  return <TripExperience trip={SAMPLE_TRIP} cta={<LandingCta />} />;
}
