# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this is

BAhelper is an Expo (React Native) app that compiles Blue Archive game data/tools: a home dashboard (Student of the Day drawing prompt, daily-reset countdown, upcoming birthdays), a searchable/filterable student roster with collection tracking, full student profile pages, and SCHALE tools (random roster generator, bond XP calculator). Further ideas live in `ideas to implement.md` (gitignored but present locally).

## Commands

```bash
npm install          # install deps
npx expo start        # start dev server (or `npm run start`)
npm run android        # start with Android target
npm run ios            # start with iOS target
npm run web             # start with web target
npm run lint           # expo lint (eslint-config-expo flat config)
npx tsc --noEmit       # typecheck (app-example/ is excluded via tsconfig)
```

There is no test suite configured in this repo currently.

On Windows, `run me.txt` documents the two commands needed in a fresh PowerShell session:
```
Set-ExecutionPolicy -Scope Process -ExecutionPolicy Bypass
npx expo start
```

## Architecture

- **Routing**: `expo-router` file-based routes under `app/`. `app/_layout.tsx` is the root `Stack` (wrapped in `UserDataProvider`); `app/(tabs)/_layout.tsx` defines the bottom tabs: Home (`index.tsx`), Students (`students/`), Tools (`tools/`), Settings (`settings/`). On iOS the tab bar is `NativeTabs` (`expo-router/unstable-native-tabs`, Liquid Glass on iOS 26); web/Android keep the JS `Tabs`. NativeTabs renders no headers, so Students/Tools/Settings are directories whose `_layout.tsx` is a one-screen `Stack` providing the header; shared header styling lives in `constants/navigation.ts` (`stackScreenOptions`, incl. `headerBackButtonDisplayMode: 'minimal'` so back buttons don't show the literal "(tabs)" group name). Non-tab stack routes: `app/student/[id].tsx` (student profile) and `app/tools/roster.tsx` / `app/tools/bond.tsx`. Typed routes are enabled (`experiments.typedRoutes`) — the generated route types in `.expo/types/router.d.ts` refresh when the dev server starts, so a stale file can cause `tsc` route-string errors after adding/renaming routes.
- **Screens**:
  - `index.tsx` — dashboard: deterministic Student of the Day (seeded by "BA day", which flips at the in-game daily reset 19:00 UTC, see `getBADayNumber`), reset countdown, upcoming-birthdays strip (favorites highlighted), quick links.
  - `students.tsx` — roster grid with search, filter chips (school/damage/armor/role/position/weapon/stars/owned/favorites), sort modes, alt-grouping toggle. Long-press a tile to toggle "owned".
  - `student/[id].tsx` — full profile: portrait hero with school-icon watermark, combat/lore/weapon/bond-gear sections, SchaleDB-style stat breakdown (level/star controls) and skills panel, alt-family navigation, header toggles for favorite/owned.
  - `tools/roster.tsx` — random 10-student SCHALE roster with per-slot lock/reroll, owned-only and 6-strikers+4-specials modes. `tools/bond.tsx` — bond XP calculator driven by `constants/bondXp.ts`.
- **State**: `context/UserDataContext.tsx` (`useUserData()`) holds owned/favorite student ID sets and app settings, persisted via AsyncStorage (`utils/storage.ts`, keys `bahelper:*`). On web this backs onto localStorage.
- **Domain helpers**: `utils/studentUtils.ts` — the single import point for student data (`allStudents`, `studentById`), plus daily-pick logic, alt grouping (`getBaseName`/`collapseAlts`/`getAltFamily` — alts are detected by the `" ("` name suffix), birthday math, and roster filter/sort helpers.
- **Design tokens**: `constants/theme.ts` — BA-flavored palette, spacing/radius scales, damage/armor color+label maps (in-game convention: a damage type is strong vs the armor type sharing its color), school display names, adaptation letter grades, reset hour constant.
- **Data model**: `types/students.ts` defines the `Students` interface — a superset schema modeled after SchaleDB's fields; most fields optional. Notes: `mood` = [Urban, Outdoor, Indoor] adaptation values 0–4 (D→S); `limited` = per-region status array (1=Limited, 2=Event, 3=Fes; other values mean permanent); `stats` holds raw Lv1/Lv100 stat pairs plus fixed points; `skills` holds trimmed skill records (ex/public/gearPublic/passive/weaponPassive/extraPassive — EX levels 1–5, others 1–10).
- **Stats & skills rendering**: `utils/statCalc.ts` replicates SchaleDB's stat formula exactly (level lerp with `.toFixed(4)` truncations + cumulative star-grade transcendence multipliers for ATK/HP/heal; DEF doesn't star-scale; unique-weapon bonuses are flat `round(lerp)` additions to ATK/HP/heal, `Standard` growth truncates the scale) — don't "simplify" the rounding chain or parity breaks. Caps live there too: student level 90, UE stars 1–4 with weapon level cap `20 + 10×star` (UE60); UE selection implies a 5★ character. `utils/skillText.ts` parses skill descriptions (`<?N>` per-level parameters, `<b|d|c|s:Key>` buff tags resolved via `constants/buffLabels.ts`, colored per `buffTagColors` in theme) into typed segments rendered as nested `<Text>`. `<kb:N>` knockback tags are resolved to distances at scrape time in `scrapper.js`.
- **Student data pipeline (local-only, gitignored dev tooling)**: `data/scrapper.js` (fetches SchaleDB `students.min.json` → `data/students.json`), `data/imagescrapper.js` / `data/iconscrapper.js` (portraits/icons into `assets/images/students|icons`), `data/schooliconscrapper.js` (school icons into `assets/images/schools`, pulled from the SchaleDB GitHub repo since the SPA swallows direct image paths), `data/skilliconscrapper.js` (unique skill icons into `assets/images/skills`, preferring the GitHub repo with a schaledb.com fallback for icons the repo lags on), `data/localizationscrapper.js` (regenerates `constants/clubLabels.ts` and `constants/buffLabels.ts` from SchaleDB's `localization.min.json` — student records carry internal club keys like `Kohshinjo68` and skill descs carry buff keys like `<b:AttackPower>` that need these maps for display names), and `data/imagemap.js` (regenerates `types/imageMap.ts`).
  - `types/imageMap.ts` (tracked) holds static `require(...)` maps: `studentPortraits`, `studentHalos`, `studentIcons` (keyed by student ID), `schoolIcons` (keyed by school name) and `skillIcons` (keyed by SchaleDB icon name, e.g. `SKILLICON_SHIROKO_EXSKILL`). Metro needs static requires — never load images by dynamic path.
  - **Halo images have no public source** (not on SchaleDB or the wikis; only in game asset bundles), so `studentHalos` is empty and the UI doesn't rely on it. Schools `WildHunt`, `Highlander`, `Sakugawa` have no icon either — UI must handle a missing `schoolIcons[school]`.
  - `data/students.json` IS tracked (runtime data source); `data/students.json.old` is a gitignored backup.
- **`components/`**: `ScreenContainer`, `SectionCard`, `StudentIconTile` (memoized grid tile, damage-type colored rim), `FilterChip`, `TypePill` (damage/armor pills), `StatBadge` (label-over-value block), `Button`, `ImageViewer`, `LevelControl` (stepper with min/MAX chips), `StatsSection` (level/star/UE-driven stat grid — gold char stars plus blue weapon stars), `SkillCard` + `SkillsSection` (EX/Basic/Enhanced/Sub with Bond Gear / UW 2★ variant toggles).
- **`assets/` is entirely gitignored** — a fresh clone must run the pipeline scripts (`scrapper.js`, `imagescrapper.js`, `iconscrapper.js`, `schooliconscrapper.js`, `skilliconscrapper.js`, then `imagemap.js`; plus `localizationscrapper.js` after a data refresh) to populate images and regenerate labels.
- **Path alias**: `@/*` maps to the repo root (see `tsconfig.json`).
- **`app-example/`** is the original `create-expo-app` template output, kept for reference only (gitignored, excluded from tsconfig, not part of the running app).

## Verification

Web smoke test: `npx expo start --web` (port 8081) and drive it with playwright-core against system Edge (`chromium.launch({ channel: 'msedge' })`); key Pressables have `testID`s (`filter-toggle`, `favorite-toggle`, `owned-toggle`) that render as `data-testid` on web.
