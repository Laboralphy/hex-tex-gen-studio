# Hex-Tex-Gen Studio

A proof of concept: a web app designing textures with
[`@laboralphy/hex-tex-gen`](../hex-tex-gen), meant to move into the
[raycaster-386 map editor](../raycaster386-map-editor) once it has proved its worth.

Searching for textures is one of the costliest parts of making a level. The studio
generates them instead: pick a wall or a ground, set a few parameters, lay decorations
over it, and export a tile.

## Running it

```bash
npm install
npm run dev       # the app on :5173
npm run check     # typecheck, lint, format, test, build
```

## What it does

- **A base texture**, picked by its thumbnail among the walls (`surface`) and the floors
  and ceilings (`ground`) of the library's catalog.
- **A simplified form**: the essential parameters of the template (its age, its colors,
  its style choices), as the library describes them; _all parameters_ shows the rest.
  Wear values derived from age stay on _auto_ until overridden.
- **Decorations** over the base, in drawing order: placed in percent of the texture, or
  repeated on the anchors of the base or of an earlier decoration (bars on an opening,
  moss under each row of stones, cobwebs in the corners of a window...).
- **Size presets** of the engine: 64 × 96 walls, 64 × 64 flats, and their doubles.
- **A live preview**, rendered in Web Workers, with a 3 × 3 tiled view to check seams.
- **Export**: the PNG, the PNG as a data URL (the form the map editor keeps its tiles
  in), and the recipe as JSON, to load and regenerate later.

## Structure

| Path                           | Role                                                         |
| ------------------------------ | ------------------------------------------------------------ |
| `src/libs/recipe.ts`           | the recipe model, and its texture definition: no Vue, tested |
| `src/stores/recipe.ts`         | the Pinia store of the recipe being edited                   |
| `src/workers/render.worker.ts` | renders definitions off the main thread                      |
| `src/libs/renderer.ts`         | the pool of workers; the latest request of a channel wins    |
| `src/components/`              | gallery, parameter form and fields, decorations, export      |

The stack and the linting are those of the map editor (Vue 3, Pinia, Vite, strict
TypeScript), so that the components move over unchanged.

## The library dependency

Until the library is published, it is taken from the sibling directory:

```json
"@laboralphy/hex-tex-gen": "file:../hex-tex-gen"
```

which uses its built `dist/`: run `npm run build` in `../hex-tex-gen` after changing it.
Once the library is on npm, replace it with a version range, such as `"^0.2.0"`, and run
`npm install`.

## Towards the map editor

The editor keeps tiles as PNG data URLs in its tiles store, saved by the vault server as
`tiles/<md5>.png`. The integration is a panel of the editor offering the studio's form,
whose _add to the tiles_ button pushes the data URL where the tile importer does; the
recipe can be kept next to the level to regenerate a tile later.
