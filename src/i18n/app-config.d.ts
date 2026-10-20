import type { LOCALES } from "./config";
import type messages from "./messages/en.json";

// Type-checks every t("…") key against the English catalog.
declare module "next-intl" {
  interface AppConfig {
    Locale: (typeof LOCALES)[number];
    Messages: typeof messages;
  }
}
