/**
 * Server logging — public API. Server-only: writes to the console and to
 * Better Stack. Never import from client components.
 */
export {
  emit,
  errorFields,
  flushLogs,
  type LogFields,
  type LogLevelName,
} from "./logger";
