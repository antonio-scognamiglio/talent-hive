import path from "path";
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";
import tailwindcss from "@tailwindcss/vite";
import type { Plugin } from "vite";

// Plugin per bloccare import dalla cartella reference-purposes-only durante la build
function blockRestrictedImports(): Plugin {
  const restrictedPatterns = [
    /["']reference-purposes-only\//,
    /["']@\/reference-purposes-only/,
    /["']\.\.\/.*reference-purposes-only\//,
  ];

  return {
    name: "block-restricted-imports",
    enforce: "pre",
    transform(code, id) {
      // Controlla solo file sorgente TypeScript/JavaScript
      if (
        !id.includes("node_modules") &&
        /\.(ts|tsx|js|jsx)$/.test(id) &&
        !id.includes("reference-purposes-only")
      ) {
        for (const pattern of restrictedPatterns) {
          if (pattern.test(code)) {
            const lines = code.split("\n");
            const errorLine = lines.findIndex((line) => pattern.test(line)) + 1;
            const match = code.match(pattern)?.[0];

            this.error(
              `🚫 Import non consentito trovato in ${id}:${errorLine}\n` +
                `   Pattern trovato: ${match || "sconosciuto"}\n` +
                `   La cartella reference-purposes-only/ è esclusa dalla build.\n` +
                `   Usa gli equivalenti da @/features/shared invece.`,
            );
          }
        }
      }
      return null;
    },
  };
}

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tsconfigPaths(), tailwindcss(), blockRestrictedImports()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
      "@shared": path.resolve(__dirname, "../shared"),
    },
  },
});
