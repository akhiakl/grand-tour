/**
 * AI domain — public API.
 *
 * Isomorphic request/output schemas: safe for client and server. The model
 * call itself lives in the server-only entry point `@/lib/ai/generate`.
 */
export * from "./destination";
export * from "./ghosts";
export * from "./handoff";
export * from "./redraft";
export * from "./schema";
