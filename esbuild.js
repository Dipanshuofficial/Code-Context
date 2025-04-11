const { build } = require("esbuild");

const baseConfig = {
  entryPoints: ["src/extension.ts"],
  bundle: true,
  outfile: "dist/extension.js",
  platform: "node",
  format: "cjs",
  target: "node16",
  sourcemap: true,
  external: ["vscode"], // Exclude vscode module
};

async function runBuild() {
  if (process.argv.includes("--watch")) {
    const ctx = await build({ ...baseConfig, watch: true });
    console.log("Watching for changes...");
    return ctx;
  } else {
    await build(baseConfig);
    console.log("Build completed");
  }
}

runBuild().catch((err) => {
  console.error(err);
  process.exit(1);
});
