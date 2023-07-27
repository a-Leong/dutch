import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";
import { resolve } from "path";
import { checker } from "vite-plugin-checker";

// https://vitejs.dev/config/
export default defineConfig({
  server: {
    host: true,
  },
  plugins: [vue(), checker({ vueTsc: true })],
  resolve: {
    alias: {
      "@": resolve(__dirname, "./src"),
    },
  },
});
