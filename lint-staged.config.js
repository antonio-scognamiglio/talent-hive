module.exports = {
  // Esegui ESLint su tutti i file JS/TS modificati all'interno di frontend/
  "frontend/**/*.{js,jsx,ts,tsx}": ["bun run --filter frontend lint"],

  // Esegui il typecheck su tutto il frontend se viene modificato un file typescript nel frontend
  "frontend/**/*.{ts,tsx}": () => "bun run typecheck:frontend",

  // Esegui il typecheck su tutto il backend se viene modificato un file typescript nel backend
  "backend/**/*.{ts,tsx}": () => "bun run typecheck:backend",

  // Se modifichi i tipi condivisi, esegui il typecheck su entrambi
  "shared/**/*.{ts,tsx}": () => [
    "bun run typecheck:frontend",
    "bun run typecheck:backend",
  ],
};
