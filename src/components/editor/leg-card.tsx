"use client";

import { Bus, Car, Plane, Ship, TrainFront } from "lucide-react";

import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import type { Leg } from "@/lib/trip";

const MODES: { value: Leg["mode"]; label: string; icon: typeof TrainFront }[] = [
  { value: "train", label: "Train", icon: TrainFront },
  { value: "bus", label: "Bus", icon: Bus },
  { value: "flight", label: "Flight", icon: Plane },
  { value: "car", label: "Car", icon: Car },
  { value: "ferry", label: "Ferry", icon: Ship },
];

export function LegCard({
  leg,
  onChange,
}: {
  readonly leg: Leg;
  readonly onChange: (patch: Partial<Leg>) => void;
}) {
  return (
    <div className="ml-5 flex items-center gap-2 border-l border-dashed border-line py-2 pl-6">
      <Select
        value={leg.mode}
        onValueChange={(mode) => onChange({ mode: mode as Leg["mode"] })}
      >
        <SelectTrigger className="w-32 shrink-0" aria-label="Transport mode">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          {MODES.map(({ value, label, icon: Icon }) => (
            <SelectItem key={value} value={value}>
              <Icon className="size-4" /> {label}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      <Input
        value={leg.label}
        onChange={(event) => onChange({ label: event.target.value })}
        placeholder="Railjet via Linz"
        aria-label="Leg description"
        className="flex-1"
      />
      <Input
        value={leg.duration}
        onChange={(event) => onChange({ duration: event.target.value })}
        placeholder="~2h 30m"
        aria-label="Leg duration"
        className="w-28 shrink-0"
      />
    </div>
  );
}
