import { ImageResponse } from "next/og";

import { makeProjector, tripStats, type LatLng } from "@/lib/trip";
import { getTrip } from "@/lib/trip/service";

export const alt = "A Grand Tour route map";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

const PALETTE = {
  paper: "#f5f1e8",
  ink: "#16233a",
  inkSoft: "#4a5568",
  brass: "#b98a2f",
};

function fallbackImage() {
  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        gap: 16,
        background: PALETTE.paper,
        fontFamily: "sans-serif",
      }}
    >
      <div
        style={{
          display: "flex",
          fontSize: 22,
          letterSpacing: 6,
          color: PALETTE.brass,
        }}
      >
        FIELD ATLAS
      </div>
      <div
        style={{
          display: "flex",
          fontSize: 48,
          color: PALETTE.ink,
          fontWeight: 600,
        }}
      >
        This map has expired
      </div>
    </div>,
    size,
  );
}

export default async function Image({
  params,
}: {
  readonly params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const trip = await getTrip(id);
  if (!trip) return fallbackImage();

  const stats = tripStats(trip);
  // Route area sits below the header, in a relatively-positioned box so
  // city labels (plain HTML — Satori doesn't support SVG <text>) can be
  // placed with `position: absolute` at their projected coordinates.
  const box = { width: 1072, height: 300, padding: 50 };
  const project = makeProjector(
    trip.cities.map((city) => city.ll as LatLng),
    box,
  );
  const points = trip.cities.map((city) => project(city.ll as LatLng));
  const pathD = points
    .map((p, i) => `${i === 0 ? "M" : "L"} ${p.x} ${p.y}`)
    .join(" ");

  return new ImageResponse(
    <div
      style={{
        width: "100%",
        height: "100%",
        display: "flex",
        flexDirection: "column",
        background: PALETTE.paper,
        padding: "56px 64px",
        fontFamily: "sans-serif",
      }}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        <div
          style={{
            display: "flex",
            fontSize: 22,
            letterSpacing: 6,
            color: PALETTE.brass,
            fontWeight: 600,
          }}
        >
          FIELD ATLAS
        </div>
        <div
          style={{
            display: "flex",
            fontSize: 58,
            color: PALETTE.ink,
            fontWeight: 600,
          }}
        >
          {trip.title}
        </div>
        <div style={{ display: "flex", fontSize: 26, color: PALETTE.inkSoft }}>
          {`${stats.cities} cities · ${stats.nights} nights · ${stats.countries} countries`}
        </div>
      </div>

      <div
        style={{
          display: "flex",
          position: "relative",
          width: box.width,
          height: box.height,
          marginTop: 24,
        }}
      >
        <svg
          width={box.width}
          height={box.height}
          style={{ position: "absolute", left: 0, top: 0 }}
        >
          <path
            d={pathD}
            stroke={PALETTE.brass}
            strokeWidth={3}
            strokeDasharray="10 8"
            fill="none"
          />
          {points.map((p, i) => (
            <circle
              key={trip.cities[i].name + i}
              cx={p.x}
              cy={p.y}
              r={8}
              fill={PALETTE.paper}
              stroke={PALETTE.brass}
              strokeWidth={4}
            />
          ))}
        </svg>
        {points.map((p, i) => (
          <div
            key={trip.cities[i].name + i}
            style={{
              display: "flex",
              position: "absolute",
              left: Math.max(0, p.x - 70),
              top: Math.max(0, p.y - 42),
              width: 140,
              justifyContent: "center",
              fontSize: 20,
              fontWeight: 600,
              color: PALETTE.ink,
            }}
          >
            {`${trip.cities[i].flag} ${trip.cities[i].name}`}
          </div>
        ))}
      </div>
    </div>,
    size,
  );
}
