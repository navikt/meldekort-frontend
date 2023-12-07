import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction, LoaderFunctionArgs } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { hentDekoratorHtml } from "~/dekorator/dekorator.server";
import parse from "html-react-parser";
import i18next from "~/i18next.server";
import { useTranslation } from "react-i18next";
import { useChangeLanguage } from "remix-i18next";

import navStyles from "@navikt/ds-css/dist/index.css";
import indexStyle from "~/index.css";

export const links: LinksFunction = () => {
  return [
    ...(cssBundleHref
      ? [
        { rel: "stylesheet", href: navStyles },
        { rel: "stylesheet", href: cssBundleHref },
        { rel: "stylesheet", href: indexStyle },
        {
          rel: "icon",
          type: "image/png",
          sizes: "32x32",
          href: "/favicon-32x32.png",
        },
        {
          rel: "icon",
          type: "image/png",
          sizes: "16x16",
          href: "/favicon-16x16.png",
        },
        {
          rel: "icon",
          type: "image/x-icon",
          href: "/favicon.ico",
        },
      ]
      : []),
  ];
}

export async function loader({ request }: LoaderFunctionArgs) {
  const fragments = await hentDekoratorHtml();
  const locale = await i18next.getLocale(request);

  return json({
    fragments,
    locale
  });
}

export const handle = {
  // In the handle export, we can add an i18n key with namespaces our route will need to load.
  // This key can be a single string or an array of strings.
  // TIP: In most cases, you should set this to your defaultNS from your i18n config or if you did not set one,
  // set it to the i18next default namespace "translation"
  i18n: "common",
};


export default function App() {

  const { fragments, locale } = useLoaderData<typeof loader>();

  const { i18n } = useTranslation();

  // This hook will change the i18n instance language to the current locale detected by the loader
  useChangeLanguage(locale);

  return (
    <html lang={locale} dir={i18n.dir()}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        {parse(fragments.DECORATOR_STYLES)}
        <Links />
      </head>
      <body>
        {parse(fragments.DECORATOR_HEADER)}
        <Outlet />
        <ScrollRestoration />
        {parse(fragments.DECORATOR_FOOTER)}
        <Scripts />
        {parse(fragments.DECORATOR_SCRIPTS)}
        <LiveReload />
      </body>
    </html>
  );
}
