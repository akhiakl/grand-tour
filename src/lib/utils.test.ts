import { describe, expect, it } from "vitest";

import { cn, escapeHtml } from "./utils";

describe("cn", () => {
  it("treats the page type scale as font sizes, not colours", () => {
    expect(cn("text-sm text-foreground", "text-section")).toBe(
      "text-foreground text-section",
    );
    expect(cn("text-lg", "text-title")).toBe("text-title");
  });
});

describe("escapeHtml", () => {
  it("escapes markup characters", () => {
    expect(escapeHtml(`<a href="x">'&'</a>`)).toBe(
      "&#60;a href=&#34;x&#34;&#62;&#39;&#38;&#39;&#60;/a&#62;",
    );
  });
});
