// Vitest stand-in for the `server-only` package marker, which throws when
// bundled into client code. Tests import server modules directly, so the
// marker is aliased to this no-op in vitest.config.ts.
export {};
