import { routePath, type LatLng } from "./geo";
import { makeProjector, type PosterBox } from "./poster-layout";

export interface SketchStop {
  name: string;
  x: number;
  y: number;
}

export interface RouteSketch {
  /** SVG path data for the curved route through every stop. */
  path: string;
  stops: SketchStop[];
}

const round = (n: number) => Math.round(n * 10) / 10;

/**
 * A static drawing of a route inside `box`: the same curved legs as the
 * live map, projected like the poster. Pure, so pages can render it on
 * the server as plain SVG with no map library.
 */
export function sketchRoute(
  cities: readonly { name: string; ll: LatLng }[],
  box: PosterBox,
): RouteSketch {
  if (cities.length === 0) return { path: "", stops: [] };

  const lls = cities.map((city) => city.ll);
  const project = makeProjector(lls, box);
  const points = lls.map(project);

  const curve = cities.length > 1 ? routePath(lls).map(project) : [];
  const path = curve
    .map(({ x, y }, i) => `${i === 0 ? "M" : "L"}${round(x)} ${round(y)}`)
    .join(" ");

  return {
    path,
    stops: cities.map((city, i) => ({
      name: city.name,
      x: round(points[i].x),
      y: round(points[i].y),
    })),
  };
}
