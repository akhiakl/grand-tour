/**
 * The Grand Tour mark — a dotted brass route between three stops on an
 * ink tile. Image routes can't read CSS tokens, so the palette (dark-theme
 * brass, light paper, ink) is spelled out here, as in the OG image.
 */
export const BRAND_MARK_SVG = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 64 64">
<rect width="64" height="64" rx="14" fill="#16233A"/>
<path d="M15 46Q22 20 34 30T50 17" fill="none" stroke="#D4A94E" stroke-width="3.2" stroke-linecap="round" stroke-dasharray="0.1 6.4"/>
<circle cx="15" cy="46" r="5" fill="#F5F1E8" stroke="#D4A94E" stroke-width="2.5"/>
<circle cx="34" cy="30" r="3.6" fill="#F5F1E8" stroke="#D4A94E" stroke-width="2.2"/>
<circle cx="50" cy="17" r="5" fill="#F5F1E8" stroke="#D4A94E" stroke-width="2.5"/>
</svg>`;

/** Raster sizes served at `/icons/{size}`: favicon, Apple touch, PWA. */
export const ICON_SIZES = [32, 180, 192, 512] as const;
