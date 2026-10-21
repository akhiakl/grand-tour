import "@testing-library/jest-dom/vitest";

import { cleanup } from "@testing-library/react";
import { afterEach, vi } from "vitest";

import messages from "@/i18n/messages/en.json";

// Components read copy through next-intl; tests resolve it from the real
// English catalog without needing a provider around every render.
vi.mock("next-intl", async (importOriginal) => {
  const actual = await importOriginal<typeof import("next-intl")>();
  return {
    ...actual,
    useLocale: () => "en",
    useTranslations: (namespace?: string) =>
      actual.createTranslator({ locale: "en", messages, namespace } as never),
  };
});

vi.mock("next-intl/server", async () => {
  const { createTranslator } = await import("next-intl");
  return {
    getLocale: async () => "en",
    getTranslations: async (arg?: string | { namespace?: string }) =>
      createTranslator({
        locale: "en",
        messages,
        namespace: typeof arg === "string" ? arg : arg?.namespace,
      } as never),
  };
});

// Auto-cleanup only registers itself when vitest globals are enabled;
// we use explicit imports, so unmount rendered trees between tests here.
afterEach(() => {
  cleanup();
});
