import { esbuildPlugin } from "@web/dev-server-esbuild";
import { readdir, readFile } from "node:fs/promises";
import { basename } from "node:path";
export default {
  files: ["test*.js"],
  nodeResolve: true,
  plugins: [esbuildPlugin({ ts: true, target: "es2020" })],
  testFramework: {
    config: {
      timeout: 500,
    },
  },
  middleware: [
    async function loadcss(ctx, next) {
      if (ctx.url === "/css/postcss-parser-tests/") {
        ctx.type = "application/json";
        ctx.body = await readdir(`./node_modules/postcss-parser-tests/cases/`);
      } else if (ctx.url.startsWith("/css/postcss-parser-tests/")) {
        ctx.body = await readFile(
          `./node_modules/postcss-parser-tests/cases/${basename(ctx.url)}`,
          "utf-8"
        );
      } else if (ctx.url === "/css/bootstrap.css") {
        ctx.body = await readFile(
          `./node_modules/bootstrap/dist/css/bootstrap.css`,
          "utf-8"
        );
      } else if (ctx.url === "/css/bootstrap.min.css") {
        ctx.body = await readFile(
          `./node_modules/bootstrap/dist/css/bootstrap.min.css`,
          "utf-8"
        );
      } else if (ctx.url === "/css/open-props/") {
        ctx.type = "application/json";
        ctx.body = (await readdir(`./node_modules/open-props/`)).filter((t) =>
          t.endsWith(".css")
        );
      } else if (ctx.url.startsWith("/css/open-props")) {
        ctx.body = await readFile(
          `./node_modules/open-props/${basename(ctx.url)}`,
          "utf-8"
        );
      } else {
        return next();
      }
    },
  ],
};
