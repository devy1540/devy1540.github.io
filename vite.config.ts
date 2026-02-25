import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "dist",
    rollupOptions: {
      output: {
        manualChunks(id) {
          if (id.includes("shiki")) {
            return "shiki"
          }
          if (id.includes("react-markdown") || id.includes("remark") || id.includes("rehype") || id.includes("unified") || id.includes("mdast") || id.includes("hast") || id.includes("micromark")) {
            return "markdown"
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
