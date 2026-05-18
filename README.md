# Arrow Maze

A single-player puzzle game: release arrow pieces from the board in the correct order.

## Development

```sh
npm install
npm run dev        # start Vite dev server at http://localhost:5173
```

Open the URL Vite prints. HMR works out of the box.

## Scripts

| Command            | What it does                                     |
| ------------------ | ------------------------------------------------ |
| `npm run dev`      | Vite dev server (HMR)                            |
| `npm run build`    | Production build into `dist/`                    |
| `npm run preview`  | Serve `dist/` locally for a final smoke test     |
| `npm test`         | Run Vitest test suite once                       |
| `npm run test:watch` | Vitest in watch mode                           |
| `npm run typecheck`| `tsc --noEmit` — type check without emitting     |
| `npm run lint`     | ESLint over `src/` and `tests/`                  |
| `npm run format`   | Prettier write across the repo                   |

## Deployment

Pushing to `main` triggers the GitHub Action in `.github/workflows/deploy.yml`, which builds and publishes `dist/` to the `gh-pages` branch. The live game is served at <https://abdouturki.github.io/ArrowMaze/>.

## Architecture

- `src/engine/` — pure puzzle logic (tiler, DAG, piece options). No DOM, no globals.
- `src/state.ts` — single mutable `state` object + `localStorage` persistence.
- `src/render/` — SVG rendering, animations, HUD.
- `src/gameplay/` — level loop, hearts, timer, hint/eraser tools, win/fail flow.
- `src/meta/` — energy, shop, achievements, daily, ads, settings, modals.
- `src/audio/` — Web Audio context + SFX.
- `tests/` — invariant tests for the engine and the persisted state shape.
