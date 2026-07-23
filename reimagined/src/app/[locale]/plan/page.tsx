import { MapTrifoldIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactElement } from "react";

import { SoonScreen } from "@/components/SoonScreen";

export default async function PlanPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <SoonScreen
      icon={MapTrifoldIcon}
      badge={t("soon.badge")}
      title={t("plan.title")}
      lede={t("plan.lede")}
      note={t("soon.note")}
    />
  );
}
