import type { Leg } from "@/lib/trip";

/** Display metadata for each transport mode (map badges + timeline chips). */
export const MODE_META: Record<Leg["mode"], { emoji: string; label: string }> = {
  train: { emoji: "🚄", label: "Train" },
  bus: { emoji: "🚌", label: "Bus" },
  flight: { emoji: "✈️", label: "Flight" },
  car: { emoji: "🚗", label: "Car" },
  ferry: { emoji: "⛴️", label: "Ferry" },
};
