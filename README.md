# bayes-beta-simulation

Simulation of beta distribution using n tosses of a biased coin.

## Run locally (Bun)

Requires [Bun](https://bun.sh/). From the repo root:

```sh
bun install
bun run dev
```

Open [http://localhost:6800/](http://localhost:6800/) (override port with `PORT=8080 bun run dev`). The page is still [`bayes-beta.htm`](bayes-beta.htm); the dev server only serves it so the app loads D3 over HTTPS without file:// quirks.
