import { test, expect } from '@playwright/test';
import { LOADING_MSG } from '../src/constants';
import type { TestAPI } from '../src/test-api';
import { STAGE_DIMENSIONS } from '../src/GameLevel/gameConfig';

// Extend the Window interface to include our test API
declare global {
  interface Window {
    __TEST_API__?: TestAPI;
  }
}

test.describe('Game', () => {
  // Shared setup for all tests
  test.beforeEach(async ({ page }) => {
    // Listen for console messages from the browser
    page.on('console', msg => console.log(`Browser console: ${msg.text()}`));

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
  });

  test('should show start button after loading', async ({ page }) => {
    // Verify the game is in intro state
    const gameState = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.app?.getSnapshot();
    });
    expect(gameState?.value).toBe('Intro');

    // // Verify the stage dimensions are set correctly
    const stageWidth = await page.evaluate(() => {
      const stage = document.querySelector('canvas');
      return stage?.width || 0;
    });
    const stageHeight = await page.evaluate(() => {
      const stage = document.querySelector('canvas');
      return stage?.height || 0;
    });

    expect(stageWidth).toBe(STAGE_DIMENSIONS.width);
    expect(stageHeight).toBe(STAGE_DIMENSIONS.height);
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

  test('should constrain chef position to max X position', async ({ page }) => {
    // Start the game
    await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      testAPI?.app?.send({ type: 'Play' });
    });

    // Wait for the game to initialize
    await page.waitForTimeout(1000);

    // Get the chef's max X position from the test API
    const maxXPos = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.chef?.getSnapshot().context.maxXPos;
    });

    // Press and hold the right arrow key
    await page.keyboard.down('ArrowRight');

    // Wait for the chef to reach max position
    await page.waitForFunction(
      maxPos => {
        const testAPI = window.__TEST_API__;
        const position = testAPI?.getChefPosition();
        return position?.x === maxPos;
      },
      maxXPos,
      { timeout: 5000 }
    );

    // Release the key
    await page.keyboard.up('ArrowRight');

    // Verify the chef's position is at max X
    const finalPosition = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPosition();
    });

    expect(finalPosition?.x).toBe(maxXPos);
  });
});
