/**
 * Trip domain — public API.
 *
 * Isomorphic model only (schemas, types, constants): safe to import from
 * client and server code alike. The Redis persistence lives in the
 * server-only entry point `@/lib/trip/service`.
 */
export * from "./geo";
export * from "./local-store";
export * from "./poster-layout";
export * from "./sample";
export * from "./schema";
export * from "./stats";
