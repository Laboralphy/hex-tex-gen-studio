# hex-tex-gen-studio

Proof of concept: a Vue 3 web app designing textures with `@laboralphy/hex-tex-gen`, to be
moved into the raycaster-386 map editor (`../raycaster386-map-editor`, not to be modified
without the user's say-so). See README.md.

- The library comes from npm (`@laboralphy/hex-tex-gen`); a new release means raising the
  range in `package.json` and `npm install`. Its catalog API (`templateCatalog`,
  `describeParameters`, `expandPath`, `deepMerge`) drives every form: never hard-code a
  template or a parameter here.
- Same stack and lint rules as the map editor (Vue 3 `<script setup>`, Pinia, Vite 8,
  strict TypeScript, Prettier 4 spaces / 100 columns), so components port unchanged.
- Logic without Vue lives in `src/libs/` and is tested in `tests/`; rendering happens in
  `src/workers/render.worker.ts`, never on the main thread.
- `npm run check` is the gate: typecheck, lint, format, test, build.
