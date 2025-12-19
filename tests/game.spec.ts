import { test, expect } from '@playwright/test';
import { LOADING_MSG } from '../src/constants';
import { type TestAPI } from '../src/test-api';
import { type GameConfig } from '../src/gameConfig';

// Extend the Window interface to include our test API
declare global {
  interface Window {
    __TEST_API__?: TestAPI;
  }
}

test.describe('@regular Game', () => {
  let gameConfig: GameConfig | undefined;

  // Shared setup for all tests
  test.beforeEach(async ({ page }) => {
    // Listen for console messages from the browser
    page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`));

    // Navigate to the game page with test mode enabled
    await page.goto('/?testMode=true');

    // Wait for loading state to disappear
    await expect(page.getByText(LOADING_MSG)).toBeHidden();

    // Wait for the canvas to be ready
    await page.waitForSelector('canvas');

    // Wait for test API to be initialized with app machine
    await page.waitForFunction(
      () => {
        const testAPI = window.__TEST_API__;
        return testAPI?.app !== null;
      },
      { timeout: 5000 }
    );

    // Verify the stage dimensions from the state machine config
    gameConfig = await page.evaluate(() => {
      return window.__TEST_API__?.app?.getSnapshot().context.gameConfig;
    });

    if (!gameConfig) {
      throw new Error('Game config is undefined');
    }

    // Wait for the app to be in a stable state
    await page.waitForFunction(
      () => {
        const testAPI = window.__TEST_API__;
        const snapshot = testAPI?.app?.getSnapshot();
        return snapshot?.status === 'active' && snapshot?.value === 'Intro';
      },
      { timeout: 5000 }
    );
  });

  test('should load the game into the Intro screen', async ({ page }) => {
    // Verify the game is in intro state
    const gameState = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.app?.getSnapshot();
    });
    expect(gameState?.value).toBe('Intro');
  });

  test('should start with score of 0', async ({ page }) => {
    // Send the Play event through the test API
    await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      testAPI?.app?.send({ type: 'Play' });
    });

    // Wait for the game to initialize and enter gameplay state
    await page.waitForTimeout(1000);

    // Get the initial score from the test API
    const score = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getGameLevelScore() ?? null;
    });

    // Assert the score is 0
    expect(score).toBe(0);
  });
});

/**
 * Speed test: Verifies that when a game level completes,
 * the app transitions to the "Next Generation Evolution" state
 * which displays the between-levels scoreboard.
 *
 * Uses speedTest mode for a super-fast level (3 hens, 10 second duration).
 */
test.describe('@regular Level Completion', () => {
  // Increase timeout for this test since it waits for level completion
  test.setTimeout(90000);

  test('should show between-levels scoreboard when level completes', async ({
    page,
  }) => {
    // Listen for console messages from the browser
    page.on('console', (msg) => console.log(`Browser console: ${msg.text()}`));

    // Navigate with speedTest mode for fast level completion
    await page.goto('/?speedTest=true');

    // Wait for loading to complete
    await expect(page.getByText(LOADING_MSG)).toBeHidden();
    await page.waitForSelector('canvas');

    // Wait for test API to be initialized
    await page.waitForFunction(
      () => {
        const testAPI = window.__TEST_API__;
        return testAPI?.app !== null;
      },
      { timeout: 5000 }
    );

    // Wait for app to be in Intro state
    await page.waitForFunction(
      () => {
        const testAPI = window.__TEST_API__;
        const snapshot = testAPI?.app?.getSnapshot();
        return snapshot?.status === 'active' && snapshot?.value === 'Intro';
      },
      { timeout: 5000 }
    );

    // Start the game
    await page.evaluate(() => {
      window.__TEST_API__?.app?.send({ type: 'Play' });
    });

    // Wait for the app to transition to "Next Generation Evolution" state
    // which displays the between-levels scoreboard after level completion
    // With speedTest mode: 3 hens, 30 second duration, 200ms entrance delay
    await page.waitForFunction(
      () => {
        const testAPI = window.__TEST_API__;
        const snapshot = testAPI?.app?.getSnapshot();
        const value = snapshot?.value;
        if (typeof value === 'object' && value !== null) {
          const gamePlayValue = (value as { 'Game Play'?: string })['Game Play'];
          return gamePlayValue === 'Next Generation Evolution';
        }
        return false;
      },
      { timeout: 60000 }
    );

    // Verify the app machine state and tags
    const appState = await page.evaluate(() => {
      const snapshot = window.__TEST_API__?.app?.getSnapshot();
      return {
        value: snapshot?.value,
        tags: Array.from(snapshot?.tags ?? []),
      };
    });

    expect(appState.value).toEqual({
      'Game Play': 'Next Generation Evolution',
    });
    expect(appState.tags).toContain('between levels');
  });
});
