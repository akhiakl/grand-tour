import * as z from "zod";

/** One GeoJSON feature from Photon's `/api` search endpoint (subset we use). */
export const PhotonFeatureSchema = z.object({
  geometry: z.object({
    coordinates: z.tuple([z.number(), z.number()]),
  }),
  properties: z.object({
    name: z.string(),
    country: z.string().optional(),
    countrycode: z.string().optional(),
    state: z.string().optional(),
  }),
});

export type PhotonFeature = z.infer<typeof PhotonFeatureSchema>;

/** Provider-agnostic shape the editor's city search consumes. */
export type CitySearchResult = {
  name: string;
  country: string;
  flag: string;
  ll: [number, number];
  displayName: string;
};
