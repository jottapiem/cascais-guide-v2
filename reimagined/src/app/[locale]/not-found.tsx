import { CompassIcon } from "@phosphor-icons/react/dist/ssr";
import { getTranslations } from "next-intl/server";
import type { ReactElement } from "react";

import { Eyebrow } from "@/components/ui/Eyebrow";
import { PillButton } from "@/components/ui/PillButton";

/**
 * The 404 for anything inside a locale — a mistyped slug, an old link. Renders
 * inside the locale layout, so it keeps the frame, the theme and the language.
 */
export default async function NotFound(): Promise<ReactElement> {
  const t = await getTranslations("notFound");

  return (
    <div className="mx-auto flex min-h-[60vh] w-full max-w-xl flex-col items-center justify-center text-center">
      <Eyebrow>{t("eyebrow")}</Eyebrow>
      <h1 className="mt-4 font-display text-4xl leading-[1.05] font-semibold tracking-tight text-balance sm:text-5xl">
        {t("title")}
      </h1>
      <p className="mt-4 text-base leading-relaxed text-text-muted text-balance">
        {t("body")}
      </p>
      <div className="mt-8">
        <PillButton href="/" icon={CompassIcon}>
          {t("action")}
        </PillButton>
      </div>
    </div>
  );
}
