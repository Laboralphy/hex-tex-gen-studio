# Hex-Tex-Gen Studio

A proof of concept: a web app designing textures with
[`@laboralphy/hex-tex-gen`](https://www.npmjs.com/package/@laboralphy/hex-tex-gen), meant to move into the
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

The library is taken from npm:

```json
"@laboralphy/hex-tex-gen": "^0.1.0"
```

To pick up a new release, raise the range and run `npm install`. To try unpublished changes
of `../hex-tex-gen`, build it there and `npm link` it here, then `npm install` to go back.

## Towards the map editor

The editor keeps tiles as PNG data URLs in its tiles store, saved by the vault server as
`tiles/<md5>.png`. The integration is a panel of the editor offering the studio's form,
whose _add to the tiles_ button pushes the data URL where the tile importer does; the
recipe can be kept next to the level to regenerate a tile later.
