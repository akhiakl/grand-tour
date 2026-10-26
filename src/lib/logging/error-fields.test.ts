import { describe, expect, it, vi } from "vitest";

vi.mock("next/server", () => ({ after: vi.fn() }));
vi.mock("@logtail/next", () => ({
  Logger: vi.fn(function () {
    return { info: vi.fn(), warn: vi.fn(), error: vi.fn(), flush: vi.fn() };
  }),
  LogLevel: { info: 1 },
}));

const { errorFields } = await import("./logger");

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
