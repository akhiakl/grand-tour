import { GUEST_MAX_CITIES } from "@/lib/trip";
import { cn } from "@/lib/utils";

export function StopsCounter({
  count,
  className,
}: {
  readonly count: number;
  readonly className?: string;
}) {
  const atLimit = count >= GUEST_MAX_CITIES;

  return (
    <span
      className={cn(
        "eyebrow inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-1",
        atLimit && "border-brass/40 text-brass",
        className,
      )}
      aria-live="polite"
    >
      {count}/{GUEST_MAX_CITIES} stops
    </span>
  );
}
