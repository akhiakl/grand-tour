import { sketchRoute, type Trip } from "@/lib/trip";

const WIDTH = 480;
const HEIGHT = 360;
// Labels sit to the right of each stop, as on the live map, so the route
// is fitted into the left part of the drawing to leave room for names.
const LABEL_ROOM = 110;
const BOX = { width: WIDTH - LABEL_ROOM, height: HEIGHT, padding: 36 };

/**
 * A still drawing of a trip's route (dashed brass legs, stop dots and
 * names) for pages that want the shape without loading the map.
 */
export function RouteSketch({
  trip,
  className,
}: {
  readonly trip: Trip;
  readonly className?: string;
}) {
  const { path, stops } = sketchRoute(trip.cities, BOX);
  const names = trip.cities.map((city) => city.name).join(", ");

  return (
    <svg
      viewBox={`0 0 ${WIDTH} ${HEIGHT}`}
      role="img"
      aria-label={`Route sketch: ${names}`}
      className={className}
    >
      <path
        d={path}
        fill="none"
        className="stroke-brass"
        strokeWidth={2.5}
        strokeDasharray="7 8"
        strokeLinecap="round"
      />
      {stops.map(({ name, x, y }) => (
        <g key={`${name}-${x}-${y}`}>
          <circle cx={x} cy={y} r={9} className="fill-brass opacity-20" />
          <circle cx={x} cy={y} r={4.5} className="fill-brass" />
          <text
            x={x + 15}
            y={y + 5}
            // A paper halo keeps names readable where a leg passes behind.
            paintOrder="stroke"
            strokeWidth={5}
            strokeLinejoin="round"
            className="fill-ink stroke-paper font-display text-[15px]"
          >
            {name}
          </text>
        </g>
      ))}
    </svg>
  );
}
