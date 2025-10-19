# Testing Guide

This document provides a practical guide to running and understanding the tests in the Egg Drop game.

For architectural details about the testing approach (Canvas testing challenges, state machine solution), see the [End-to-End Testing with Playwright](README.md#-end-to-end-testing-with-playwright) section in the README.

## Quick Start

```bash
# Run all tests
pnpm test        # Unit tests
pnpm test:e2e    # E2E tests

# Or run everything
pnpm ci          # Run all CI checks (lint, type check, tests)
```

## Test Scripts Reference

### Unit Tests (Vitest)

| Command           | Description                  |
| ----------------- | ---------------------------- |
| `pnpm test`       | Run unit tests once          |
| `pnpm test:watch` | Run unit tests in watch mode |

### E2E Tests (Playwright)

| Command                | Description                             |
| ---------------------- | --------------------------------------- |
| `pnpm test:e2e`        | Run regular E2E tests (headless)        |
| `pnpm test:e2e:headed` | Run regular E2E tests (visible browser) |
| `pnpm test:e2e:debug`  | Run regular E2E tests in debug mode     |
| `pnpm test:e2e:report` | View the last test report               |
| `pnpm test:automated`  | Run automated gameplay tests (ChefBot)  |
| `pnpm test:all`        | Run all Playwright tests                |

### Quality Checks

| Command       | Description                                              |
| ------------- | -------------------------------------------------------- |
| `pnpm tsc`    | Run TypeScript type checking                             |
| `pnpm lint`   | Run ESLint                                               |
| `pnpm format` | Format code with Prettier                                |
| `pnpm ci`     | Run CI checks (lint, type check, tests)                  |
| `pnpm check`  | Run comprehensive checks (lint, type check, test, build) |

## Test Types

### Unit Tests

Fast, isolated tests for individual components and state machines.

**Location:** `src/**/*.test.ts`

**Current coverage:**

- `hen.machine.test.ts` - Hen state machine (4 tests)
- `eggCaughtPoints.machine.test.ts` - Egg caught points animation (4 tests)

**Run with:**

```bash
pnpm test
```

### E2E Tests - Regular (`@regular` tag)

Fast end-to-end tests that verify basic game functionality. Run on every PR.

**Location:** `tests/game.spec.ts`

**What's tested:**

- Game loads into Intro screen
- Initial score is 0

**Run with:**

```bash
pnpm test:e2e
```

### E2E Tests - Automated (`@automated` tag)

Long-running automated gameplay tests using the ChefBot AI. Run manually via GitHub Actions.

**Location:** `tests/game-automated.spec.ts`

**What's tested:**

- ChefBot plays full game automatically
- Catches eggs using sophisticated scoring algorithm
- Verifies score increments correctly

**Run with:**

```bash
pnpm test:automated  # Takes up to 5 minutes
```

### Visual Tests (Currently Skipped)

Screenshot-based visual regression tests.

**Location:** `tests/game-visual.spec.ts`

**Status:** Currently skipped - visual testing is deprioritized in favor of state machine testing.

## Running Specific Tests

### Run a Single Test File

```bash
# Playwright
pnpm playwright test tests/game.spec.ts

# Vitest
pnpm test src/Hen/hen.machine.test.ts
```

### Run Tests Matching a Pattern

```bash
# Playwright - by test name
pnpm playwright test -g "should start with score"

# Vitest - by file pattern
pnpm test hen.machine
```

### Run in Debug Mode

```bash
# Playwright - opens inspector
pnpm test:e2e:debug

# Vitest - opens debug UI
pnpm test:watch
```

## Viewing Test Results

### Local Test Reports

After running Playwright tests, view the HTML report:

```bash
pnpm test:e2e:report
```

The report includes:

- Test execution videos
- Screenshots at each step
- Detailed error messages
- Performance metrics

### CI Test Reports

When tests run in GitHub Actions:

1. Navigate to the **Actions** tab in your PR
2. Click on the workflow run
3. Scroll to the **Artifacts** section
4. Download either:
   - `playwright-report` - for regular tests
   - `playwright-automated-report` - for automated tests
5. Extract and open `index.html` in your browser

## Test Files Overview

### Unit Tests

```
src/
├── Hen/
│   └── hen.machine.test.ts              # Hen state machine tests
└── EggCaughtPoints/
    └── eggCaughtPoints.machine.test.ts  # Points animation tests
```

### E2E Tests

```
tests/
├── game.spec.ts              # Regular E2E tests (@regular)
├── game-automated.spec.ts    # Automated gameplay tests (@automated)
├── game-visual.spec.ts       # Visual snapshot tests (skipped)
├── helpers.ts                # Test utilities
└── machines/
    ├── chefBot.machine.ts    # ChefBot AI state machine
    └── helpers.ts            # ChefBot helpers
```

## Test API

When running in test mode (`?testMode=true`), the game exposes `window.__TEST_API__`:

```typescript
interface TestAPI {
  app: AppActorRef | null;
  getGameConfig: () => GameConfig | undefined;
  getChefPosition: () => ChefData;
  getChefAndEggsData: () => ChefAndEggsData;
  getGameLevelScore: () => number;
  // ... and more
}
```

This allows tests to:

- Access game state directly
- Query positions and velocities
- Monitor state machine transitions
- Make assertions about game state

## Troubleshooting

### Playwright browsers not installed

```
Error: browserType.launch: Executable doesn't exist
```

**Solution:**

```bash
pnpm playwright install
```

### Tests timeout

**For regular tests:**

- Default timeout is 30 seconds
- Check if the dev server is running (`pnpm dev`)

**For automated tests:**

- Default timeout is 5 minutes
- ChefBot tests can take longer depending on gameplay

### Port already in use

```
Error: Port 5173 is already in use
```

**Solution:**

- Stop other instances of `pnpm dev`
- Or kill the process using port 5173

### Test API not available

```
Error: Cannot read property 'app' of undefined
```

**Solution:**

- Ensure you're navigating to `/?testMode=true`
- Wait for the test API to initialize before accessing it

## Next Steps

- See [README.md](README.md#-end-to-end-testing-with-playwright) for testing architecture details
- See [State Machine Testing](https://stately.ai/docs/testing) for XState testing patterns
- See [Playwright Docs](https://playwright.dev) for Playwright API reference
