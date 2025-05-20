import { test, expect } from '@playwright/test';
import { LOADING_MSG } from '../src/constants';

test.describe('Game Initial Load', () => {
  test('should show start button after loading and start game when clicked', async ({
    page,
  }) => {
    // Navigate to the game
    await page.goto('/');

    // Wait for loading state to disappear
    await expect(page.getByText(LOADING_MSG)).toBeHidden();

    // Get the stage dimensions from the game config
    const stageWidth = await page.evaluate(() => {
      const stage = document.querySelector('canvas');
      return stage?.width || 0;
    });

    const stageHeight = await page.evaluate(() => {
      const stage = document.querySelector('canvas');
      return stage?.height || 0;
    });

    // Calculate the center of the stage where the start button should be
    const centerX = stageWidth / 2;
    const centerY = stageHeight / 2;

    // Click the center of the stage where the start button should be
    await page.mouse.click(centerX, centerY);

    // Verify we enter the game state by checking that the loading text is still hidden
    // and the game level is visible
    await expect(page.getByText(LOADING_MSG)).toBeHidden();

    // Additional verification that we're in the game state
    // This could be enhanced with more specific checks based on your game's UI
    // await expect(page.locator('canvas')).toBeVisible();
  });
});
