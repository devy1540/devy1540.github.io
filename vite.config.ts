import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import { postAssetsPlugin } from "./scripts/post-assets"
import { imageAssetsPlugin } from "./scripts/image-assets"
import { previewPagesPlugin } from "./scripts/preview-pages"

export default defineConfig({
  plugins: [
    postAssetsPlugin(),
    imageAssetsPlugin(),
    previewPagesPlugin(),
    react(),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    manifest: true,
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (/[/\\](render-queue|render-cache|code-languages)\.ts$/.test(id)) {
            return "rendering-runtime"
          }
          if (/[/\\]node_modules[/\\](react|react-dom|scheduler)[/\\]/.test(id)) {
            return "react"
          }
          if (id.includes("shiki")) {
            return "shiki"
          }
          if (id.includes("react-router")) {
            return "router"
          }
          if (id.includes("radix-ui") || id.includes("@radix")) {
            return "ui"
          }
        },
      },
    },
  },
})
