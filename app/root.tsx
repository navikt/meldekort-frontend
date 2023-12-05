import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import { json } from "@remix-run/node";
import { Links, LiveReload, Meta, Outlet, Scripts, ScrollRestoration, useLoaderData } from "@remix-run/react";
import { hentDekoratorHtml } from "~/dekorator/dekorator.server";
import parse from "html-react-parser";

import navStyles from "@navikt/ds-css/dist/index.css";
import indexStyle from "~/index.css";

export const links: LinksFunction = () => {
  return [
    ...(cssBundleHref
        ? [
          { rel: "stylesheet", href: navStyles },
          { rel: "stylesheet", href: cssBundleHref },
          { rel: "stylesheet", href: indexStyle },
        ]
        : []),
  ];
}

export async function loader() {
  const fragments = await hentDekoratorHtml();

  return json({
    fragments,
  });
}

export default function App() {

  const { fragments } = useLoaderData<typeof loader>();

  return (
    <html lang="en">
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
