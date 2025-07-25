import { resolve } from "node:path";
import { PassThrough } from "node:stream";

import { createReadableStreamFromReadable } from "@react-router/node";
import { createInstance } from "i18next";
import Backend from "i18next-fs-backend";
import { isbot } from "isbot";
import { renderToPipeableStream } from "react-dom/server";
import { I18nextProvider, initReactI18next } from "react-i18next";
import { ActionFunctionArgs, EntryContext, LoaderFunctionArgs } from "react-router";
import { ServerRouter } from "react-router";

import i18n from "./i18n"; // i18n configuration file
import i18next from "./i18next.server";


// Reject/cancel all pending promises after 5 seconds
export const streamTimeout = 5000;

export default async function handleRequest(
  request: Request,
  responseStatusCode: number,
  responseHeaders: Headers,
  reactRouterContext: EntryContext,
) {
  const callbackName = isbot(request.headers.get("user-agent"))
    ? "onAllReady"
    : "onShellReady";

  const instance = createInstance();
  const lng = await i18next.getLocale(request);
  const ns = i18next.getRouteNamespaces(reactRouterContext);

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
        <ServerRouter context={reactRouterContext} url={request.url} />
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

    // Automatically timeout the React renderer after 6 seconds, which ensures
    // React has enough time to flush down the rejected boundary contents
    setTimeout(abort, streamTimeout + 1000);
  });
}

export function handleError(
  error: unknown,
  {
    request,
  }: LoaderFunctionArgs | ActionFunctionArgs,
) {
  if (!request.signal.aborted) {
    console.error(error);
  }
}
