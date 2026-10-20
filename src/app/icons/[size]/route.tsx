import { ImageResponse } from "next/og";

import { BRAND_MARK_SVG, ICON_SIZES } from "../brand-mark";

export const dynamicParams = false;

export function generateStaticParams() {
  return ICON_SIZES.map((size) => ({ size: String(size) }));
}

const markDataUri = `data:image/svg+xml;base64,${Buffer.from(BRAND_MARK_SVG).toString("base64")}`;

/** PNG renditions of the brand mark (favicon fallback, Apple touch, PWA). */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ size: string }> },
) {
  const size = Number((await params).size);
  return new ImageResponse(
    // eslint-disable-next-line @next/next/no-img-element -- satori renders <img>, not next/image
    <img src={markDataUri} width={size} height={size} alt="" />,
    { width: size, height: size },
  );
}
