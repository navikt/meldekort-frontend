import type { FlatNamespace, KeyPrefix } from 'i18next';
import i18next from 'i18next';
import type { $Tuple } from 'react-i18next/helpers';
import type { FallbackNs, UseTranslationOptions } from 'react-i18next';
import { useTranslation } from 'react-i18next';
import type { ReactElement } from 'react';


export interface TTFunction {
  (
    ...args:
      | [key: string]
  ): string;
}

// Hook
// Bare "syntactic sugar" slik at vi kan bruke "tt" i stedet for "t"
// "tt" kaller "t" men gir en nøkkel uten ytelsestypePostfix som en "fallback"
export function useExtendedTranslation<
  Ns extends FlatNamespace | $Tuple<FlatNamespace> | undefined = undefined,
  KPrefix extends KeyPrefix<FallbackNs<Ns>> = undefined,
>(
  ns?: Ns,
  options?: UseTranslationOptions<KPrefix>,
) {
  const { i18n, t } = useTranslation(ns, options);

  const tt: TTFunction = (key: string) => {
    return t([key, key.split('-')[0]]);
  };

  return { i18n, tt };
}

// Denne funksjonen trigger ikke oppdatering av komponenter når bruker bytter språk.
// Så den må brukes kun i hjelpefunksjoner som er plassert i separate filer og hvor det ikker er mulig å bruke useExtendedTranslation/tt.
// Komponenter må bruke useExtendedTranslation/tt
export function getText(key: string, values?: object): string {
  // Prøv å finne tekst med den gitte nøkkelen
  // Hvis teksten ikke blir funnet, prøv nøkkelen uten postfix
  let text = i18next.t([key, key.split('-')[0]]) || key;
  text = text.trim();

  if (values) {
    for (const key in values) {
      text = text.replace('{' + key + '}', (values as any)[key]);
    }
  }

  return text;
}

export function parseHtml(text: string, values?: string[] | null): ReactElement {
  if (values) {
    for (const key in values) {
      text = text.replace('{' + key + '}', values[key]);
    }
  }

  return (
    <span dangerouslySetInnerHTML={{ __html: text }} />
  );
}
