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

  test('should show start button after loading', async ({ page }) => {
    // Verify the game is in intro state
    const gameState = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.app?.getSnapshot();
    });
    expect(gameState?.value).toBe('Intro');

    // Verify the stage dimensions from the state machine config
    const stageDimensions = await page.evaluate(() => {
      return window.__TEST_API__?.app?.getSnapshot().context.gameConfig
        .stageDimensions;
    });
    expect(stageDimensions).toBeDefined();
    expect(stageDimensions?.width).toBe(STAGE_DIMENSIONS.width);
    expect(stageDimensions?.height).toBe(STAGE_DIMENSIONS.height);
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

  test('should constrain chef position to min X position', async ({ page }) => {
    // Start the game
    await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      testAPI?.app?.send({ type: 'Play' });
    });

    // Wait for the game to initialize
    await page.waitForTimeout(1000);

    // Get the chef's max X position from the test API
    const minXPos = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.chef?.getSnapshot().context.minXPos;
    });

    // Press and hold the right arrow key
    await page.keyboard.down('ArrowLeft');

    // Wait for the chef to reach max position
    await page.waitForFunction(
      minXPos => {
        const testAPI = window.__TEST_API__;
        const position = testAPI?.getChefPosition();
        return position?.x === minXPos;
      },
      minXPos,
      { timeout: 5000 }
    );

    // Release the key
    await page.keyboard.up('ArrowLeft');

    // Verify the chef's position is at max X
    const finalPosition = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPosition();
    });

    expect(finalPosition?.x).toBe(minXPos);
  });

  test('should track the first egg and move the chef to catch it', async ({
    page,
  }) => {
    let testAPI: TestAPI | undefined;

    // Start the game
    await page.evaluate(() => {
      testAPI = window.__TEST_API__;
      testAPI?.app?.send({ type: 'Play' });
    });

    // Wait for the first egg actor to be added to the test API
    const firstCatchableEggId = await page.waitForFunction(
      () => {
        // console.log('checking for first egg id');
        testAPI = window.__TEST_API__;
        const gameLevel = testAPI?.gameLevel;
        if (!gameLevel) return false;
        const eggActorRefs = gameLevel.getSnapshot().context.eggActorRefs;
        const catchableEggActorRefs = eggActorRefs.filter(
          eggRef => eggRef.getSnapshot().context.color !== 'black'
        );
        return catchableEggActorRefs.length > 0
          ? catchableEggActorRefs[0].id
          : false;
      },
      { timeout: 20_000 }
    );

    // Let's assess the egg actor ref's xPosition and move the Chef to that position
    const firstEggXPos = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      const gameLevel = testAPI?.gameLevel;
      if (!gameLevel) return false;
      const eggActorRefs = gameLevel.getSnapshot().context.eggActorRefs;
      return eggActorRefs[0].getSnapshot().context.position.x;
    });

    if (!firstEggXPos) {
      throw new Error('First egg X position is undefined');
    }

    const chefXPos = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPosition()?.x;
    });

    if (!chefXPos) {
      throw new Error('Chef X position is undefined');
    }

    // Determine which direction to move the Chef
    const keyToPress = firstEggXPos < chefXPos ? 'ArrowLeft' : 'ArrowRight';
    const moveDirection: 'right' | 'left' =
      keyToPress === 'ArrowRight' ? 'right' : 'left';

    // Assess the chef's X position
    const chefPotRimHitX = await page.evaluate(direction => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPotRimCenterHitX(direction);
    }, moveDirection);

    if (!chefPotRimHitX) {
      throw new Error('Chef X position is undefined');
    }

    await page.keyboard.down(keyToPress);

    // Wait for the Chef to reach the first egg actor's xPosition
    await page.waitForFunction(
      ({ firstEggXPos, direction }) => {
        const testAPI = window.__TEST_API__;
        const chefXPos = testAPI?.getChefPosition()?.x;
        const potRimHitX = testAPI?.getChefPotRimCenterHitX(direction);

        if (!potRimHitX) {
          throw new Error('Chef pot rim hit X is undefined');
        }

        return direction === 'right'
          ? potRimHitX >= firstEggXPos
          : potRimHitX <= firstEggXPos;
      },
      { firstEggXPos, direction: moveDirection },
      { timeout: 5000 }
    );

    // Release the key
    await page.keyboard.up(keyToPress);

    // Wait until the first egg actor is removed from the test API
    await page.waitForFunction(
      eggId => {
        const testAPI = window.__TEST_API__;
        const gameLevel = testAPI?.gameLevel;
        if (!gameLevel) return false;
        const eggActorRefs = gameLevel.getSnapshot().context.eggActorRefs;
        return !eggActorRefs.some(ref => ref.id === eggId);
      },
      await firstCatchableEggId,
      { timeout: 10000 }
    );
  });
});
