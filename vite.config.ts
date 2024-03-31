import { vitePlugin as remix } from "@remix-run/dev";
import { installGlobals } from "@remix-run/node";
import { defineConfig } from "vite";
import tsconfigPaths from "vite-tsconfig-paths";
import path from "path"

installGlobals();

export default defineConfig({
  ssr: {
    noExternal: ["remix-utils"],
  },
  plugins: [remix(), tsconfigPaths()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      ".prisma/client/index-browser": "./node_modules/.prisma/client/index-browser.js"
    },
  },
});
