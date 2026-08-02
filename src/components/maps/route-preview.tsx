import { makeProjector, type City, type LatLng } from "@/lib/trip";

const BOX = { width: 400, height: 160, padding: 24 };

/** A small abstract route sketch — the same projection math as the poster
 * and OG image, just rendered as a plain (non-Satori) SVG for a card. */
export function RoutePreview({ cities }: { readonly cities: City[] }) {
  const project = makeProjector(
    cities.map((city) => city.ll as LatLng),
    BOX,
  );
  const points = cities.map((city) => project(city.ll as LatLng));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return (
    <svg
      viewBox={`0 0 ${BOX.width} ${BOX.height}`}
      className="h-28 w-full rounded-lg bg-secondary"
      aria-hidden
    >
      <path
        d={pathD}
        stroke="var(--brass)"
        strokeWidth={2}
        strokeDasharray="6 6"
        fill="none"
      />
      {points.map((p, i) => (
        <circle
          key={cities[i].name + i}
          cx={p.x}
          cy={p.y}
          r={5}
          fill="var(--card-solid)"
          stroke="var(--brass)"
          strokeWidth={2.5}
        />
      ))}
    </svg>
  );
}
