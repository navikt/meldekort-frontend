/** @type {import("@remix-run/dev").AppConfig} */
module.exports = {
  serverDependenciesToBundle: ["remix-i18next/server", "remix-i18next/client"],
  ignoredRouteFiles: ["**/.*"],
  serverModuleFormat: "cjs",
  publicPath: "/meldekort/build",
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // serverBuildPath: "build/index.js",
};
