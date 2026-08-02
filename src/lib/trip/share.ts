import type { Trip } from "./schema";

export type ShareOutcome =
  | { kind: "success"; id: string }
  | { kind: "city_limit"; limit: number }
  | { kind: "error"; message: string };

const ERROR_MESSAGES: Record<number, string> = {
  413: "That route is too large to share — trim a few details and try again.",
  429: "The atlas needs a breather — try sharing again in a moment.",
  500: "Couldn't save your route — try again shortly.",
};

const DEFAULT_ERROR_MESSAGE = "Couldn't share your route — try again.";

/** POSTs a draft to `/api/trips`, mapping the route's status codes to a UI-ready outcome. */
export async function shareTrip(trip: Trip): Promise<ShareOutcome> {
  let response: Response;
  try {
    response = await fetch("/api/trips", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify(trip),
    });
  } catch {
    return { kind: "error", message: DEFAULT_ERROR_MESSAGE };
  }

  if (response.status === 201) {
    try {
      const body = (await response.json()) as { id: string };
      if (typeof body?.id === "string") return { kind: "success", id: body.id };
    } catch {
      // fall through to generic error
    }
    return { kind: "error", message: DEFAULT_ERROR_MESSAGE };
  }

  if (response.status === 403) {
    try {
      const body = (await response.json()) as { limit: number };
      if (typeof body?.limit === "number")
        return { kind: "city_limit", limit: body.limit };
    } catch {
      // fall through to generic error
    }
    return { kind: "error", message: DEFAULT_ERROR_MESSAGE };
  }

  return {
    kind: "error",
    message: ERROR_MESSAGES[response.status] ?? DEFAULT_ERROR_MESSAGE,
  };
}
