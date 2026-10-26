import { testerFeedback } from "@/flags";

/** Whether to show the feedback button; off when the flag is missing or unreachable. */
export async function GET() {
  let enabled = false;
  try {
    enabled = (await testerFeedback()) === true;
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
