# Testing Guide

## Quick Start

```bash
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests
pnpm ci          # All CI checks
```

## Test Commands

**Unit Tests (Vitest)**

- `pnpm test` - Run once
- `pnpm test:watch` - Watch mode

**E2E Tests (Playwright)**

- `pnpm test:e2e` - Regular tests (headless)
- `pnpm test:e2e:headed` - With visible browser
- `pnpm test:e2e:debug` - Debug mode
- `pnpm test:e2e:report` - View HTML report
- `pnpm test:automated` - ChefBot automated gameplay
- `pnpm test:all` - All Playwright tests

**General dev commands** (`lint`, `format`, `tsc`, etc.) are in the [README](README.md#-development-commands).

## Test Types

**Unit Tests** - `src/**/*.test.ts`

- Hen state machine (4 tests)
- Egg caught points animation (4 tests)

**E2E Regular** (`@regular`) - `tests/game.spec.ts`

- Game loads into Intro screen
- Initial score is 0
- Runs on every PR

**E2E Automated** (`@automated`) - `tests/game-automated.spec.ts`

- ChefBot plays full games autonomously
- Sophisticated egg-scoring algorithm
- Takes ~5 minutes, runs manually

See [README](README.md#-end-to-end-testing-with-playwright) for architecture details.

## Running Specific Tests

```bash
# Single file
pnpm playwright test tests/game.spec.ts
pnpm test src/Hen/hen.machine.test.ts

# By pattern
pnpm playwright test -g "should start with score"
pnpm test hen.machine

# Debug
pnpm test:e2e:debug    # Playwright inspector
pnpm test:watch        # Vitest UI
```

## Viewing Test Results

**Local**

```bash
pnpm test:e2e:report  # Opens HTML report with videos, screenshots, errors
```

**CI**

1. Go to Actions tab in your PR
2. Download artifact: `playwright-report` or `playwright-automated-report`
3. Open `index.html`

## Test Files

```
src/
├── Hen/hen.machine.test.ts
└── EggCaughtPoints/eggCaughtPoints.machine.test.ts

tests/
├── game.spec.ts              # @regular
├── game-automated.spec.ts    # @automated
├── helpers.ts
└── machines/
    ├── chefBot.machine.ts    # AI that plays the game
    └── helpers.ts
```

## Test API

Navigate to `/?testMode=true` to expose `window.__TEST_API__`:

```typescript
interface TestAPI {
  app: AppActorRef | null;
  getGameConfig: () => GameConfig | undefined;
  getChefPosition: () => ChefData;
  getChefAndEggsData: () => ChefAndEggsData;
  getGameLevelScore: () => number;
  // ...
}
```

## Troubleshooting

**Browsers not installed**

```bash
pnpm playwright install
```

**Tests timeout**

- Regular tests: 30s timeout, check dev server is running
- Automated tests: 5min timeout, ChefBot takes time

**Port 5173 in use**

- Kill other `pnpm dev` instances

**Test API unavailable**

- Navigate to `/?testMode=true`
- Wait for API to initialize

---

**Further reading:** [Testing Architecture](README.md#-end-to-end-testing-with-playwright) • [XState Testing](https://stately.ai/docs/testing) • [Playwright Docs](https://playwright.dev)
