import type { Leg } from "@/lib/trip";

/**
 * Badge emoji for each transport mode (map badges + timeline chips); the
 * mode's name is translated from the catalog's `Modes` namespace.
 */
export const MODE_META: Record<Leg["mode"], { emoji: string }> = {
  train: { emoji: "🚄" },
  bus: { emoji: "🚌" },
  flight: { emoji: "✈️" },
  car: { emoji: "🚗" },
  ferry: { emoji: "⛴️" },
};
