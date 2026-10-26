import "server-only";

import { Logger, LogLevel } from "@logtail/next";
import { after } from "next/server";

/** Primitives only, so request bodies, trip content and whole errors can't be logged by accident. */
export type LogFields = Record<string, string | number | boolean | undefined>;

export type LogLevelName = "info" | "warn" | "error";

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

const write = {
  info: (line: string) => console.info(line),
  warn: (line: string) => console.warn(line),
  error: (line: string) => console.error(line),
};

// shortcut: every line is sent, no sampling, so a flood of refused requests
// logs one line each. Add sampling if the source nears its plan's ingest cap.
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
  write[level](line);
  remote[level](message, fields);
  flushAfterResponse();
}

/**
 * Ship the batch once the response is out, so a function that freezes right
 * after responding still delivers it. Outside a request after() throws, so
 * flush directly there.
 */
function flushAfterResponse(): void {
  try {
    after(() => flushLogs());
  } catch {
    void flushLogs();
  }
}

/**
 * Serverless functions can freeze once they respond, so send pending lines
 * first. A slow or failing Better Stack never holds up or breaks an error
 * response: the wait is capped and a rejected send is swallowed.
 */
export function flushLogs(timeoutMs = 2000): Promise<void> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<void>((resolve) => {
    timer = setTimeout(resolve, timeoutMs);
  });
  const flushed = remote.flush().catch(() => {});
  return Promise.race([flushed, timeout]).finally(() => clearTimeout(timer));
}
