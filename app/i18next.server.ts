import { resolve } from "node:path";

import Backend from "i18next-fs-backend";
import { createCookie } from "react-router";
import { createI18nextMiddleware } from "remix-i18next";

import i18n from "~/i18n"; // your i18n configuration file

export const [i18nextMiddleware, getLocale, getInstance] = createI18nextMiddleware({
  detection: {
    supportedLanguages: i18n.supportedLngs,
    fallbackLanguage: i18n.fallbackLng,
    // We will use only cookies for detection of preferred language. If there is no cookie we will use fallbackLng
    order: ["cookie"],
    cookie: createCookie("decorator-language"),
  },
  // This is the configuration for i18next used when translating messages server-side only
  i18next: {
    ...i18n,
    backend: {
      loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json"),
    },
  },
  // The i18next plugins you want RemixI18next to use for `i18n.getFixedT` inside loaders and actions.
  // E.g. The Backend plugin for loading translations from the backend (or file system)
  plugins: [Backend],
});
