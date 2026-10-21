import { BRAND_MARK_SVG } from "../brand-mark";

export const dynamic = "force-static";

export function GET() {
  return new Response(BRAND_MARK_SVG, {
    headers: {
      "Content-Type": "image/svg+xml",
      "Cache-Control": "public, max-age=86400, immutable",
    },
  });
}
