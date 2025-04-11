const esbuild = require("esbuild");

esbuild
  .build({
    entryPoints: ["src/extension.ts"],
    bundle: true,
    platform: "node",
    target: "node18",
    outfile: "dist/extension.js",
    external: ["vscode"], // Only exclude 'vscode' since it’s provided by VSCodium
    sourcemap: true,
  })
  .catch(() => process.exit(1));
