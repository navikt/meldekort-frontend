import type { ReactElement } from "react";
import type { FlatNamespace, KeyPrefix } from "i18next";
import i18next from "i18next";
import { useTranslation } from "react-i18next";
import type { $Tuple } from "react-i18next/helpers";
import type { FallbackNs, UseTranslationOptions } from "react-i18next";

export const getText = (key: string, values?: object): string => {
  // Prøv å finne tekst med den gitte nøkkelen
  // Hvis teksten ikke blir funnet, prøv nøkkelen uten postfix
  let text = i18next.t([key, key.split("-")[0]]).trim()

  if (values) {
    for (const key in values) {
      text = text.replace("{" + key + "}", (values as any)[key])
    }
  }

  return text
}

export const parseHtml = (text: string, values?: Array<string>): ReactElement => {
  if (values) {
    for (const key in values) {
      text = text.replace("{" + key + "}", values[key])
    }
  }

  return (
    <span dangerouslySetInnerHTML={{ __html: text }} />
  )
}

// Hook
// Bare "syntactic sugar" slik at vi kan bruke "tt" i stedet for "t"
// "tt" kaller "t" men gir en nøkkel uten ytelsestypePostfix som en "fallback"
export interface TTFunction {
  (
    ...args:
      | [key: string]
  ): string;
}

export function useExtendedTranslation<
  Ns extends FlatNamespace | $Tuple<FlatNamespace> | undefined = undefined,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>,
) {
  const { i18n, t } = useTranslation(ns, options)

  const tt: TTFunction = (key: string) => {
    return t([key, key.split("-")[0]])
  }

  return { i18n, tt }
}