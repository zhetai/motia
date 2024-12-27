// packages/wistro/esbuild.config.js
import * as esbuild from "esbuild";

const ctx = await esbuild.context({
  entryPoints: ["src/core/index.js"],
  bundle: true,
  platform: "node",
  format: "esm",
  outdir: "dist/node",
  external: [
    // Node.js built-ins
    "path",
    "fs",
    "url",
    "querystring",
    "http",
    "https",
    "stream",
    "zlib",
    "events",
    "crypto",
    "util",
    "buffer",
    "string_decoder",
    "async_hooks",
    // External dependencies
    "express",
    "body-parser",
    "react",
    "react-dom",
    "reactflow",
  ],
  sourcemap: true,
});

if (process.argv.includes("--watch")) {
  await ctx.watch();
} else {
  await ctx.rebuild();
  await ctx.dispose();
}
