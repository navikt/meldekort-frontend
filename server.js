import { requestTokenxOboToken } from "@navikt/oasis";
import { createRequestHandler } from "@react-router/express";
import compression from "compression";
import express from "express";
import promBundle from "express-prom-bundle";
import morgan from "morgan";


export const app = express();

const basePath = process.env.BASE_PATH || "/meldekort";
const port = process.env.PORT || 8080;
const isProductionMode = process.env.NODE_ENV === "production";

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

app.get(`${basePath}/internal/isAlive`, (_, res) => res.sendStatus(200));
app.get(`${basePath}/internal/isReady`, (_, res) => res.sendStatus(200));

if (isProductionMode) {
  app.use(
    promBundle({
      metricsPath: `${basePath}/internal/metrics`,
      buckets: [0.1, 0.5, 1, 1.5],
    }),
  );
}

// Vite fingerprints its assets so we can cache forever
app.use(
  `${basePath}/assets`,
  express.static("build/client/assets", {
    immutable: true,
    maxAge: "1y",
  }),
)

// Everything else (like favicon.ico) is cached for an hour
app.use(
  `${basePath}`,
  express.static(isProductionMode ? "build/client" : "public", {
    maxAge: "1h",
  }),
)

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

  let onBehalfOfToken = "";
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

if (isProductionMode) {
  app.use(
    `${basePath}`,
    createRequestHandler({
      build: await import("./build/server/index.js"),
    })
  );
} else {
  const viteDevServer = await import("vite").then((vite) =>
    vite.createServer({
      base: `${basePath}`,
      server: { middlewareMode: true },
    })
  );
  app.use(
    `${basePath}`,
    viteDevServer.middlewares
  );
  app.use(
    `${basePath}`,
    createRequestHandler({
      build: () =>
        viteDevServer.ssrLoadModule(
          "virtual:react-router/server-build"
        ),
    })
  );
}

app.listen(port, () => {
  console.log("App listening on port " + port);
});
