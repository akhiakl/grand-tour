import { getTranslations } from "next-intl/server";

import { OffTheMap } from "@/components/off-the-map";

export default async function NotFound() {
  const t = await getTranslations("Errors.notFound");
  return (
    <OffTheMap title={t("title")} action={{ href: "/", label: t("action") }}>
      {t("body")}
    </OffTheMap>
  );
}
