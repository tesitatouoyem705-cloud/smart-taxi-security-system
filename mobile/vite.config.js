import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [
    react(),
    tailwindcss()
  ],
  server: {
    port: 5174,
    host: true,
    watch: {
      ignored: [
        "**/build/**",
        "**/.dart_tool/**",
        "**/android/**",
        "**/ios/**",
        "**/windows/**"
      ]
    }
  }
});
