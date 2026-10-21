import { getRequestConfig } from "next-intl/server";

import { DEFAULT_LOCALE } from "./config";

/** Per-request i18n config for server components (single locale for now). */
export default getRequestConfig(async () => ({
  locale: DEFAULT_LOCALE,
  messages: (await import(`./messages/${DEFAULT_LOCALE}.json`)).default,
}));
