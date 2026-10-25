import "server-only";

import { Logger, LogLevel } from "@logtail/next";

/** Primitives only, so request bodies, trip content and whole errors can't be logged by accident. */
export type LogFields = Record<string, string | number | boolean | undefined>;

export type LogLevelName = "warn" | "error";

/**
 * Server logs print to the console and, when BETTER_STACK_SOURCE_TOKEN and
 * BETTER_STACK_INGESTING_URL are set, ship to Better Stack. The package's own
 * console printer is silenced so each line prints exactly once.
 */
const remote = new Logger({
  source: "grand-tour",
  logLevel: LogLevel.info,
  prettyPrint: () => {},
});

export function emit(
  level: LogLevelName,
  message: string,
  fields: LogFields = {},
): void {
  const line = JSON.stringify({
    level,
    message,
    ...fields,
    dt: new Date().toISOString(),
  });
  if (level === "error") console.error(line);
  else console.warn(line);
  remote[level](message, fields);
}

/**
 * Serverless functions can freeze once they respond, so send pending lines
 * first. Capped so a slow Better Stack never holds up an error response.
 */
export function flushLogs(timeoutMs = 2000): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  return Promise.race([remote.flush(), timeout]).finally(() => clearTimeout(timer));
}
