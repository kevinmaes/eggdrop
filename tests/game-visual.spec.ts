import { test, expect } from '@playwright/test';

// Visual regression tests for the Egg Drop game

test.describe('Game Visuals', () => {
  test('intro screen should match visual snapshot', async ({ page }) => {
    // Go to the game in test mode
    await page.goto('/?testMode=true');

    // Wait for the canvas to be present
    const canvas = await page.waitForSelector('canvas');

    // Wait for the game to be in the intro state
    await page.waitForFunction(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.app?.getSnapshot().value === 'Intro';
    });

    // Take a screenshot of the canvas only
    const screenshot = await canvas.screenshot();

    // Compare to baseline snapshot (will create one on first run)
    expect(screenshot).toMatchSnapshot('intro-screen-canvas.png');
  });

  test.skip('should show the game level scoreboard and the Start button between game play levels ', () => {});
});
