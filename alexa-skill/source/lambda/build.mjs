import esbuild from "esbuild";

await esbuild.build({
  bundle: true,
  define: {
    "process.env.MAPBOX_TOKEN": JSON.stringify(process.env.MAPBOX_TOKEN ?? ""),
  },
  entryPoints: ["index.ts"],
  outfile: "index.js",
  platform: "node",
  target: "node12.22",
});
