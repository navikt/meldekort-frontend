import { PassThrough } from "node:stream";
import type { ActionFunctionArgs, EntryContext, LoaderFunctionArgs } from "@remix-run/node";
import { createReadableStreamFromReadable } from "@remix-run/node";
import { RemixServer } from "@remix-run/react";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { createInstance } from "i18next";
import i18next from "./i18next.server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import Backend from "i18next-fs-backend";
import i18n from "./i18n"; // i18n configuration file
import { resolve } from "node:path";
import morgan from "morgan";
import promBundle from "express-prom-bundle";
import { requestTokenxOboToken } from "@navikt/oasis";
import { createExpressApp } from "remix-create-express-app";
import compression from "compression";
import express from "express";


const ABORT_DELAY = 5_000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  remixContext: EntryContext,
) {
  const callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  const instance = createInstance();
  const lng = await i18next.getLocale(request);
  const ns = i18next.getRouteNamespaces(remixContext);

  await instance
    .use(initReactI18next) // Tell our instance to use react-i18next
    .use(Backend) // Setup backend (filesystem-backend)
    .init({
      ...i18n, // Spread the configuration
      lng, // The locale we detected above
      ns, // The namespaces the route about to render wants to use
      backend: { loadPath: resolve("./public/locales/{{lng}}/{{ns}}.json") },
    });

  return new Promise((resolve, reject) => {
    let didError = false;

    const { pipe, abort } = renderToPipeableStream(
      <I18nextProvider i18n={instance}>
        <RemixServer context={remixContext} url={request.url} />
      </I18nextProvider>,
      {
        [callbackName]: () => {
          const body = new PassThrough();
          const stream = createReadableStreamFromReadable(body);

          responseHeaders.set("Content-Type", "text/html");

          resolve(
            new Response(stream, {
              headers: responseHeaders,
              status: didError ? 500 : responseStatusCode,
            }),
          );

          pipe(body);
        },
        onShellError(error: unknown) {
          reject(error);
        },
        onError(error: unknown) {
          didError = true;

          console.error(error);
        },
      },
    );

    setTimeout(abort, ABORT_DELAY);
  });
}

export function handleError(
  error: unknown,
  {
    request,
    params,
    context,
  }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  if (!request.signal.aborted) {
    console.error(error);
  }
}

export const app = createExpressApp({
  configure: app => {
    const basePath = process.env.BASE_PATH;
    const isProductionMode = process.env.NODE_ENV === 'production'

    app.use(compression());

    // http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
    app.disable("x-powered-by");

    // Everything else (like favicon.ico) is cached for an hour. You may want to be more aggressive with this caching
    app.use(`${basePath}`, express.static("public", { maxAge: "1h" }));

    app.get(`${basePath}/internal/isAlive|isReady`, (_, res) => res.sendStatus(200));

    if (isProductionMode) {
      app.use(
        promBundle({
          metricsPath: `${basePath}/internal/metrics`,
          buckets: [0.1, 0.5, 1, 1.5],
        }),
      );
    }

    // Morgan is an HTTP request logger middleware
    // We should use Morgan after isAlive|isReady and metrics so as Morgan doesn't log these requests
    app.use(morgan("tiny"));

    // This is used when we test the app locally
    app.get(`${basePath}/api/tekst/hentAlle`, (_, res) => res.send("{}"));

    // i18next tries to load texts from files, but we don't have these texts in files, we have them in meldekort-api
    // So we check what i18next wants to get, fetch data from meldekort-api and return to i18next
    app.get(`${basePath}/locales/:sprak/:fraDato.json`, async (req, res) => {
      const sprak = req.params["sprak"] || "nb";
      const fraDato = req.params["fraDato"] || "1000-01-01";

      const feilmelding = sprak === "nb" ? "Noe gikk galt" : "Something went wrong";

      let token = req.headers.authorization || "";
      token = token.substring(7); // Take everything after "Bearer "

      let onBehalfOfToken: string | null = "";
      // There is no point in fetching OBO Token when the given token is empty
      if (token) {
        try {
          const onBehalfOf = await requestTokenxOboToken(token, process.env.MELDEKORT_API_AUDIENCE || "");
          if (onBehalfOf.ok) {
            onBehalfOfToken = onBehalfOf.token;
          }
        } catch (error) {
          console.log(error);
        }
      }

      // Get texts from meldekort-api using given params and OBO token
      fetch(`${process.env.MELDEKORT_API_URL}/tekst/hentAlle?sprak=${sprak}&fraDato=${fraDato}`, {
        method: "GET",
        headers: {
          Accept: "application/json",
          TokenXAuthorization: `Bearer ${onBehalfOfToken}`,
        },
      })
        .then((response) => {
          if (response.status >= 400) {
            throw new Error(
              `Unexpected response status ${response.status} ${response.statusText} for ${response.url}`,
            );
          }

          return response.json();
        })
        .then((json) => res.send(json))
        .catch((err) => {
          console.error(err);
          res.send({ "feilmelding.baksystem": feilmelding });
        });
    });
  }
});
