import { SuitcaseRollingIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations, setRequestLocale } from "next-intl/server";
import type { ReactElement } from "react";

import { SoonScreen } from "@/components/SoonScreen";

/**
 * Bags is a core pillar (SPEC §3, §4), not a nicety — but it is a large
 * interactive module (a store, weight meters, packing mode) that deserves its
 * own focused build. Until then this stays an honest placeholder rather than
 * half-working UI.
 */
export default async function BagsPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<ReactElement> {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations();

  return (
    <SoonScreen
      icon={SuitcaseRollingIcon}
      badge={t("soon.badge")}
      title={t("bags.title")}
      lede={t("bags.lede")}
      note={t("bags.soonNote")}
    />
  );
}
