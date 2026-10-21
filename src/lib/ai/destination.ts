import { GenerateRequestSchema } from "./schema";

/** Link to the AI planner with the destination question already answered. */
export function planHref(destination: string): string {
  return `/plan?${new URLSearchParams({ destination })}`;
}

/**
 * A `?destination=` value the planner can use as its first answer, or
 * undefined when it's missing or outside the generator's contract.
 */
export function destinationFromParam(
  value: string | string[] | undefined,
): string | undefined {
  if (typeof value !== "string") return undefined;
  const parsed = GenerateRequestSchema.shape.destination.safeParse(value.trim());
  return parsed.success ? parsed.data : undefined;
}
