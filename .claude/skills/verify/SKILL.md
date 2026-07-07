---
name: verify
description: Build/launch/drive recipe for verifying BAhelper changes in the running app (Expo web + Playwright against system Edge).
---

# Verifying BAhelper changes

## Launch

```bash
npx expo start --web --port 8081   # run_in_background; ready in ~20-30s
# wait: until curl -s -o /dev/null http://localhost:8081/; do sleep 2; done
```

## Drive

`playwright-core` is already in the repo's `node_modules`; there is no
bundled browser, so launch the system Edge channel. When the driver script
lives outside the repo (e.g. scratchpad), set
`NODE_PATH="<repo>/node_modules"` or `require()` fails.

```js
const { chromium } = require('playwright-core');
const browser = await chromium.launch({ channel: 'msedge' });
const page = await browser.newPage({ viewport: { width: 420, height: 900 } });
await page.goto('http://localhost:8081/student/10000', { waitUntil: 'networkidle' });
```

- `testID` props render as `data-testid` on web — use `page.getByTestId(...)`.
- Deep links work: `/student/{id}`, `/tools/roster`, `/tools/bond`.

## Useful flows / fixtures

- **Aru (id 10000)** is the do-everything stats fixture: 2 bond alts
  (10031 New Year, 10089 Dress), UE with Street/Urban +1 terrain boost at
  3★ (`stat-ue-star-3`), gear slots Hat/Hairpin/Watch.
- Stats panel testIDs: `stat-level`, `stat-star-N`, `stat-ue-star-N`,
  `weapon-level`, `stat-advanced-toggle` (expands Gear · Bond · Talent),
  `equip-N` (gear picker trigger; options `equip-N-tier-T`), `bond-level-*`
  / `bond-alt-{id}-*` stepper buttons (`-minus/-plus/-min/-max`),
  `potential-hp/atk/heal-*`, `bond-gear-toggle`, `mood-Street/Outdoor/Indoor`.
- Stepper rows put testIDs on the buttons only, not the row itself.
- Quick numeric parity check: Hat gear is a pure ATK % coefficient
  (T10 = +50%), so ATK should multiply exactly; setting back to T0 must
  restore the old value. Compare edge cases against schaledb.com.

## Gotchas

- Assets are gitignored; if images 404, run the `data/*scrapper.js`
  pipeline then `node data/imagemap.js`.
- SchaleDB `Terrain_*.png` / other game-UI glyphs are white-on-transparent
  — invisible on light backgrounds unless tinted (`tintColor` on expo-image).
- Capture `page.on('console')` errors; Metro overlays swallow some.
