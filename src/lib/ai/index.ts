/**
 * AI domain — public API.
 *
 * Isomorphic request/output schemas: safe for client and server. The Groq
 * call itself lives in the server-only entry point `@/lib/ai/generate`.
 */
export * from "./schema";
