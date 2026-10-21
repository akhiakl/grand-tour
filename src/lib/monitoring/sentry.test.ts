import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

const sentry = vi.hoisted(() => ({
  init: vi.fn(),
  captureException: vi.fn(),
}));
vi.mock("@sentry/nextjs", () => sentry);

const DSN = "https://key@o1.ingest.sentry.io/1";

async function load() {
  vi.resetModules();
  return import("./sentry");
}

const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

describe("captureError", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  it("does nothing without a DSN", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    const { captureError } = await load();
    captureError(new Error("boom"));
    await flush();
    expect(sentry.init).not.toHaveBeenCalled();
    expect(sentry.captureException).not.toHaveBeenCalled();
  });

  it("initialises Sentry once, then reports each error", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    const { captureError } = await load();
    const first = new Error("first");
    captureError(first);
    captureError(new Error("second"));
    await flush();
    expect(sentry.init).toHaveBeenCalledTimes(1);
    expect(sentry.init).toHaveBeenCalledWith(
      expect.objectContaining({
        dsn: DSN,
        dataCollection: { userInfo: false, httpBodies: [] },
      }),
    );
    expect(sentry.captureException).toHaveBeenCalledTimes(2);
    expect(sentry.captureException).toHaveBeenCalledWith(first);
  });

  it("drops Sentry's global handlers so errors aren't reported twice", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    const { captureError } = await load();
    captureError(new Error("boom"));
    await flush();
    const { integrations } = sentry.init.mock.calls[0][0];
    expect(integrations([{ name: "GlobalHandlers" }, { name: "Dedupe" }])).toEqual([
      { name: "Dedupe" },
    ]);
  });
});

describe("watchGlobalErrors", () => {
  beforeEach(() => vi.clearAllMocks());
  afterEach(() => vi.unstubAllEnvs());

  it("reports uncaught errors and rejections", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", DSN);
    const { watchGlobalErrors } = await load();
    const add = vi.spyOn(window, "addEventListener");
    watchGlobalErrors();
    const error = new Error("uncaught");
    window.dispatchEvent(new ErrorEvent("error", { error }));
    const rejection = Object.assign(new Event("unhandledrejection"), {
      reason: "rejected",
    });
    window.dispatchEvent(rejection);
    await flush();
    expect(sentry.captureException).toHaveBeenCalledWith(error);
    expect(sentry.captureException).toHaveBeenCalledWith("rejected");
    for (const [type, listener] of add.mock.calls) {
      window.removeEventListener(type, listener as EventListener);
    }
    add.mockRestore();
  });

  it("listens for nothing without a DSN", async () => {
    vi.stubEnv("NEXT_PUBLIC_SENTRY_DSN", "");
    const { watchGlobalErrors } = await load();
    const add = vi.spyOn(window, "addEventListener");
    watchGlobalErrors();
    expect(add).not.toHaveBeenCalled();
    add.mockRestore();
  });
});
