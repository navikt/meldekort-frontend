import * as path from "node:path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import promBundle from "express-prom-bundle";
import { createRequestHandler, type RequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import sourceMapSupport from "source-map-support";
import { requestTokenxOboToken } from "@navikt/oasis";

// Patch in Remix runtime globals
installGlobals();
sourceMapSupport.install();

/**
 * @typedef {import("@remix-run/node").ServerBuild} ServerBuild
 */
const BUILD_PATH = path.resolve("./build/index.js");
const WATCH_PATH = path.resolve("./build/version.txt");

const port = process.env.PORT || 8080;

/**
 * Initial build
 * @type {ServerBuild}
 */
let build = require(BUILD_PATH);

// We'll make chokidar a dev dependency so as it doesn't get bundled in production
const chokidar = process.env.NODE_ENV === "development" ? require("chokidar") : null;

const app = express();

app.use(compression());

// http://expressjs.com/en/advanced/best-practice-security.html#at-a-minimum-disable-x-powered-by-header
app.disable("x-powered-by");

// Remix fingerprints its assets so we can cache forever.
app.use("/build", express.static("public/build", { immutable: true, maxAge: "1y" }));

// Everything else (like favicon.ico) is cached for an hour. You may want to be more aggressive with this caching
app.use(express.static("public", { maxAge: "1h" }));

app.get(`/internal/isAlive|isReady`, (_, res) => res.sendStatus(200));

app.use(
  promBundle({
    metricsPath: `/internal/metrics`,
    buckets: [0.1, 0.5, 1, 1.5],
  })
);

// Morgan is an HTTP request logger middleware
// We should use Morgan after isAlive|isReady and metrics so as Morgan doesn't log these requests
app.use(morgan("tiny"));

// This is used when we test the app locally
app.get("/api/tekst/hentAlle", (_, res) => res.send("{}"));

// i18next tries to load texts from files, but we don"t have these texts in files, we have them in meldekort-api
// So we check what i18next wants to get, fetch data from meldekort-api and return to i18next
app.get("/locales/:sprak/:fraDato.json", async (req, res) => {
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
          `Unexpected response status ${response.status} ${response.statusText} for ${response.url}`
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

// Check if the server is running in development mode and use the devBuild to reflect realtime changes in the codebase
app.all(
  "*",
  process.env.NODE_ENV === "development"
    ? createDevRequestHandler()
    : createRequestHandler({
      build,
      mode: process.env.NODE_ENV,
    })
);

app.listen(port, async () => {
  console.log(`Express server listening on port ${port}`);

  // Send "ready" message to dev server
  if (process.env.NODE_ENV === "development") {
    await broadcastDevReady(build);
  }
});

// Create a request handler that watches for changes to the server build during development
function createDevRequestHandler(): RequestHandler {
  async function handleServerUpdate() {
    // 1. Re-import the server build
    build = await reimportServer();

    // Add debugger to assist in v2 dev debugging
    if (build?.assets === undefined) {
      console.log(build.assets);
      debugger;
    }

    // 2. Tell dev server that this app server is now up-to-date and ready
    await broadcastDevReady(build);
  }

  chokidar
    ?.watch(WATCH_PATH, { ignoreInitial: true })
    .on("add", handleServerUpdate)
    .on("change", handleServerUpdate);

  // Wrap request handler to make sure its recreated with the latest build for every request
  return async (req, res, next) => {
    try {
      return createRequestHandler({
        build,
        mode: "development",
      })(req, res, next);
    } catch (error) {
      next(error);
    }
  };
}

// CJS require cache busting
/**
 * @type {() => Promise<ServerBuild>}
 */
async function reimportServer() {
  // 1. Manually remove the server build from the required cache
  Object.keys(require.cache).forEach((key) => {
    if (key.startsWith(BUILD_PATH)) {
      delete require.cache[key];
    }
  });

  // 2. Re-import the server build
  return require(BUILD_PATH);
}
