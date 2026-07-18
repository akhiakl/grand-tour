import { tripStats, type Trip } from "@/lib/trip";

function StatCard({ value, caption }: { value: string | number; caption: string }) {
  return (
    <div className="frost min-w-[132px] rounded-[14px] px-4 py-2.5">
      <b className="block font-display text-xl font-medium">{value}</b>
      <span className="text-[10px] tracking-[0.16em] text-muted-foreground uppercase">
        {caption}
      </span>
    </div>
  );
}

export function StatsStrip({ trip }: { trip: Trip }) {
  const stats = tripStats(trip);
  const [low, high] = stats.budget;

  return (
    <aside className="pointer-events-none fixed top-24 left-4 z-30 hidden flex-col gap-2 sm:left-7 md:flex">
      <StatCard value={stats.nights} caption="Nights" />
      <StatCard
        value={stats.cities}
        caption={`Cities · ${stats.countries} countr${stats.countries === 1 ? "y" : "ies"}`}
      />
      <StatCard
        value={`~${stats.totalKm.toLocaleString("en-US")} km`}
        caption="Total route"
      />
      <StatCard
        value={`€${low.toLocaleString("en-US")}–${high.toLocaleString("en-US")}`}
        caption="Est. budget / person"
      />
    </aside>
  );
}
