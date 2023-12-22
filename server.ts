import * as path from "node:path";
import express from "express";
import compression from "compression";
import morgan from "morgan";
import { createRequestHandler, type RequestHandler } from "@remix-run/express";
import { broadcastDevReady, installGlobals } from "@remix-run/node";
import sourceMapSupport from "source-map-support";

// Patch in Remix runtime globals
installGlobals();
sourceMapSupport.install();

/**
 * @typedef {import('@remix-run/node').ServerBuild} ServerBuild
 */
const BUILD_PATH = path.resolve("./build/index.js");
const WATCH_PATH = path.resolve("./build/version.txt");

const basePath = "/meldekort";
const port = process.env.PORT || 3000;

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
app.use(
  "/build",
  express.static("public/build", { immutable: true, maxAge: "1y" })
);

// Everything else (like favicon.ico) is cached for an hour. You may want to be more aggressive with this caching
app.use(express.static("public", { maxAge: "1h" }));

app.use(morgan("tiny"));

app.get(`${basePath}/internal/isAlive|isReady`, (_, res) => res.sendStatus(200));

// This is used when we test the app locally
app.get("/api/tekst/hentAlle", (_, res) => res.send("{}"))
app.get("/dekorator/css/client.css", (_, res) => res.sendStatus(200))
app.get("/dekorator/client.js", (_, res) => res.send(""))
app.get("/dekorator", (_, res) => res.send("" +
  "{" +
  "  window: {" +
  "    document: '" +
  "      <div id=\"styles\"> </div>" +
  "      <div id=\"scripts\"> </div>" +
  "      <div id=\"header-withmenu\"><div style=\"height: 80px; border-bottom: 1px solid #e9e7e7;\">HEADER</div></div>" +
  "      <div id=\"footer-withmenu\"><div style=\"height: 400px; background: #003453; color: #ffffff;\">FOOTER</div></div>" +
  "    '" +
  "  }" +
  "}"
))

app.get("/locales/:sprak/:fraDato.json", (req, res) => {
    const sprak = req.params["sprak"] || "nb"
    const fraDato = req.params["fraDato"] || "1000-01-01"

    const feilmelding = (sprak === "nb") ? "Noe gikk galt" : "Something went wrong"

    fetch(
      `http://localhost:8801/meldekort/meldekort-api/api/tekst/hentAlle?sprak=${sprak}&fraDato=${fraDato}`,
      {
        method: "GET"
      })
      .then(response => response.json())
      .then(json => res.send(json))
      .catch(err => {
        console.error('Error:' + err)
        res.send({ "feilmelding.baksystem": feilmelding })
      })
  }
)

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
