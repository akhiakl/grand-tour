import { beforeEach, describe, expect, it, vi } from "vitest";

const remote = vi.hoisted(() => ({
  info: vi.fn(),
  warn: vi.fn(),
  error: vi.fn(),
  flush: vi.fn(() => Promise.resolve()),
}));
const after = vi.hoisted(() => vi.fn());
const LoggerConstructor = vi.hoisted(() =>
  vi.fn(function () {
    return remote;
  }),
);

vi.mock("next/server", () => ({ after }));

vi.mock("@logtail/next", () => ({
  Logger: LoggerConstructor,
  LogLevel: { debug: 0, info: 1, warn: 2, error: 3, off: 100 },
}));

const { emit, errorFields, flushLogs } = await import("./logger");

describe("server logger", () => {
  beforeEach(() => {
    remote.info.mockClear();
    remote.warn.mockClear();
    remote.error.mockClear();
    remote.flush.mockClear();
    after.mockReset();
  });

  it("writes one JSON line to the console with the fields it was given", () => {
    const consoleWarn = vi.spyOn(console, "warn").mockImplementation(() => {});

    emit("warn", "ai retry", { attempt: 2, outcome: "upstream" });

    expect(consoleWarn).toHaveBeenCalledTimes(1);
    const line = JSON.parse(String(consoleWarn.mock.calls[0]?.[0]));
    expect(line).toMatchObject({
      level: "warn",
      message: "ai retry",
      attempt: 2,
      outcome: "upstream",
    });
    expect(line.dt).toEqual(expect.any(String));
    consoleWarn.mockRestore();
  });

  it("writes info lines to console.info and Better Stack", () => {
    const consoleInfo = vi.spyOn(console, "info").mockImplementation(() => {});

    emit("info", "trip shared", { route: "/api/trips" });

    expect(JSON.parse(String(consoleInfo.mock.calls[0]?.[0]))).toMatchObject({
      level: "info",
      message: "trip shared",
      route: "/api/trips",
    });
    expect(remote.info).toHaveBeenCalledWith("trip shared", { route: "/api/trips" });
    consoleInfo.mockRestore();
  });

  it("schedules a flush after the response so a frozen function still ships it", async () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});

    emit("warn", "request refused", { route: "/api/trips" });

    expect(after).toHaveBeenCalledTimes(1);
    await after.mock.calls[0]?.[0]();
    expect(remote.flush).toHaveBeenCalledTimes(1);
  });

  it("flushes directly when called outside a request, where after() throws", () => {
    vi.spyOn(console, "warn").mockImplementation(() => {});
    after.mockImplementation(() => {
      throw new Error("after was called outside a request scope");
    });

    expect(() => emit("warn", "request refused")).not.toThrow();
    expect(remote.flush).toHaveBeenCalledTimes(1);
  });

  it("forwards the same message and fields to Better Stack", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    emit("error", "request failed", { route: "/t/[id]", digest: "123" });

    expect(remote.error).toHaveBeenCalledWith("request failed", {
      route: "/t/[id]",
      digest: "123",
    });
  });

  it("keeps the package's own console printer off so each line prints once", () => {
    expect(LoggerConstructor).toHaveBeenCalledWith(
      expect.objectContaining({
        source: "grand-tour",
        prettyPrint: expect.any(Function),
      }),
    );
    const calls = LoggerConstructor.mock.calls as unknown as [
      { prettyPrint: () => void },
    ][];
    expect(calls[0]?.[0].prettyPrint()).toBeUndefined();
  });

  it("waits for pending lines to send before resolving flushLogs", async () => {
    await flushLogs();

    expect(remote.flush).toHaveBeenCalledTimes(1);
  });

  it("does not throw when Better Stack rejects the flush", async () => {
    remote.flush.mockReturnValueOnce(Promise.reject(new Error("network down")));

    await expect(flushLogs()).resolves.toBeUndefined();
  });

  it("stops waiting on a stalled Better Stack after the timeout", async () => {
    vi.useFakeTimers();
    remote.flush.mockReturnValueOnce(new Promise<void>(() => {}));

    const flushed = flushLogs(2000);
    await vi.advanceTimersByTimeAsync(2000);

    await expect(flushed).resolves.toBeUndefined();
    vi.useRealTimers();
  });
});

describe("errorFields", () => {
  it("keeps the name and system code, drops the message", () => {
    const error = new TypeError("fetch failed https://x?key=secret", {
      cause: { code: "ECONNRESET" },
    });
    expect(errorFields(error)).toEqual({
      errorName: "TypeError",
      errorCode: "ECONNRESET",
    });
  });

  it("describes a non-error throw by its type only", () => {
    expect(errorFields("boom")).toEqual({ errorName: "string" });
  });
});
