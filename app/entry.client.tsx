import { RemixBrowser } from "@remix-run/react";
import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import Backend from "i18next-http-backend";
import { startTransition, StrictMode } from "react";
import { hydrateRoot } from "react-dom/client";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { getInitialNamespaces } from "remix-i18next/client";

import { getEnv } from "~/utils/envUtils";

import i18n from "./i18n"; // i18n configuration file


async function hydrate() {
  await i18next
    .use(initReactI18next) // Tell i18next to use the react-i18next plugin
    .use(LanguageDetector) // Set up a client-side language detector
    .use(Backend) // Setup backend (use http-backend)
    .init({
      ...i18n, // Spread the configuration
      ns: getInitialNamespaces(),  // This function detects the namespaces your routes rendered while SSR use
      backend: { loadPath: `${getEnv("BASE_PATH")}/locales/{{lng}}/{{ns}}.json` },
      detection: {
        // We will use only cookies for detection of preferred language. If there is no cookie we will use fallbackLng
        order: ["cookie"],
        lookupCookie: "decorator-language",
        // Disable cache for language
        caches: [],
      },
    });

  startTransition(() => {
    hydrateRoot(
      document,
      <I18nextProvider i18n={i18next}>
        <StrictMode>
          <RemixBrowser />
        </StrictMode>
      </I18nextProvider>,
    );
  });
}

if (window.requestIdleCallback) {
  window.requestIdleCallback(hydrate);
} else {
  // Safari doesn't support requestIdleCallback
  // https://caniuse.com/requestidlecallback
  window.setTimeout(hydrate, 1);
}
