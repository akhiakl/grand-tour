import { flagsClient } from "@vercel/flags-core";

/** Vercel Flag that switches the public-test feedback button on. */
export const TESTER_FEEDBACK_FLAG = "tester-feedback";

/** Whether to show the feedback button; off when the flag is missing or unreachable. */
export async function GET() {
  let enabled = false;
  try {
    const result = await flagsClient.evaluate<boolean>(TESTER_FEEDBACK_FLAG, false);
    enabled = result.value === true;
  } catch {
    // Flags unavailable: keep the button off.
  }
  return Response.json(
    { enabled },
    {
      headers: { "Cache-Control": "public, s-maxage=60, stale-while-revalidate=60" },
    },
  );
}
