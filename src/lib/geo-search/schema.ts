import { z } from "zod";

/** Shape returned by Nominatim's `format=jsonv2` search endpoint (subset we use). */
export const NominatimResultSchema = z.object({
  lat: z.string(),
  lon: z.string(),
  display_name: z.string(),
  address: z
    .object({
      city: z.string().optional(),
      town: z.string().optional(),
      village: z.string().optional(),
      municipality: z.string().optional(),
      country: z.string().optional(),
      country_code: z.string().optional(),
    })
    .optional(),
});

export type NominatimResult = z.infer<typeof NominatimResultSchema>;

/** Provider-agnostic shape the editor's city search consumes. */
export type CitySearchResult = {
  name: string;
  country: string;
  flag: string;
  ll: [number, number];
  displayName: string;
};
