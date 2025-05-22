import { test, expect } from '@playwright/test';
import { LOADING_MSG } from '../src/constants';
import { type TestAPI } from '../src/test-api';
import { getGameConfig } from '../src/GameLevel/gameConfig';

// Set a longer timeout for all tests in this file
test.setTimeout(300000); // 5 minutes

// Extend the Window interface to include our test API
declare global {
  interface Window {
    __TEST_API__?: TestAPI;
  }
}

test.describe('@automated Game', () => {
  let gameConfig: ReturnType<typeof getGameConfig> | undefined;

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

  test('should move the chef to catch eggs one after another until the level ends', async ({
    page,
  }) => {
    test.setTimeout(300000); // 5 minutes for this specific test
    let whiteEggsCaught = 0;
    let goldEggsCaught = 0;
    let blackEggsCaught = 0;
    let totalEggsCaught = 0;
    let totalScore = 0;

    // Start the game
    await page.evaluate(() => {
      window.__TEST_API__?.app?.send({ type: 'Play' });
    });

    // Helper function to catch a single egg
    async function catchNextEgg(): Promise<boolean> {
      // Check if game is still playing
      const isPlaying = await page.evaluate(() => {
        const testAPI = window.__TEST_API__;
        const gameLevel = testAPI?.gameLevel;
        return gameLevel?.getSnapshot().matches('Playing');
      });
      if (!isPlaying) return false;

      // Wait for and get the next catchable egg
      const catchableEggHandle = await page.waitForFunction(
        () => {
          const testAPI = window.__TEST_API__;
          const gameLevel = testAPI?.gameLevel;
          if (!gameLevel) return undefined;
          const eggActorRefs = gameLevel.getSnapshot().context.eggActorRefs;
          const catchableEggActorRefs = eggActorRefs.filter(
            eggRef => eggRef.getSnapshot().context.color !== 'black'
          );
          if (catchableEggActorRefs.length > 0) {
            const catchableEggRef = catchableEggActorRefs[0];
            const context = catchableEggRef.getSnapshot().context;
            return {
              id: catchableEggRef.id,
              position: context.position,
            };
          }
          return undefined;
        },
        { timeout: 20000 }
      );
      const catchableEggData = await catchableEggHandle.jsonValue();
      if (!catchableEggData) return false;

      const eggXPos = catchableEggData.position.x;

      // Get chef's current position
      const chefXPos = await page.evaluate(() => {
        const testAPI = window.__TEST_API__;
        return testAPI?.getChefPosition()?.x;
      });
      if (typeof chefXPos !== 'number') return false;

      // Move chef to catch the egg
      const keyToPress = eggXPos < chefXPos ? 'ArrowLeft' : 'ArrowRight';
      const moveDirection: 'right' | 'left' =
        keyToPress === 'ArrowRight' ? 'right' : 'left';

      const chefPotRimHitX = await page.evaluate(
        (direction: 'right' | 'left') => {
          const testAPI = window.__TEST_API__;
          return testAPI?.getChefPotRimCenterHitX(direction);
        },
        moveDirection
      );
      if (!chefPotRimHitX) return false;

      await page.keyboard.down(keyToPress);

      // Wait for chef to reach egg position
      await page.waitForFunction(
        ({
          eggXPos,
          direction,
        }: {
          eggXPos: number;
          direction: 'right' | 'left';
        }) => {
          const testAPI = window.__TEST_API__;
          const potRimHitX = testAPI?.getChefPotRimCenterHitX(direction);
          if (!potRimHitX) return false;
          return direction === 'right'
            ? potRimHitX >= eggXPos
            : potRimHitX <= eggXPos;
        },
        { eggXPos, direction: moveDirection },
        { timeout: 5000 }
      );

      await page.keyboard.up(keyToPress);

      // Wait for egg to be caught and get result
      const doneEggHandle = await page.waitForFunction(
        async eggRefId => {
          const testAPI = window.__TEST_API__;
          if (testAPI) {
            const doneEggActorRef =
              testAPI?.findAndDeleteDoneEggActorRef(eggRefId);
            if (doneEggActorRef !== null) {
              const snapshot = doneEggActorRef?.getSnapshot();
              const { resultStatus, color } = snapshot?.context ?? {};
              return {
                id: eggRefId,
                resultStatus,
                color,
              };
            }
          }
          return null;
        },
        catchableEggData.id,
        { timeout: 6000 }
      );
      const doneEggData = await doneEggHandle.jsonValue();

      if (doneEggData !== null && doneEggData.resultStatus === 'Caught') {
        totalEggsCaught++;
        console.log('Egg caught', doneEggData.id, 'Total:', totalEggsCaught);
        switch (doneEggData.color) {
          case 'white':
            whiteEggsCaught++;
            totalScore += gameConfig?.egg.points.white ?? 0;
            break;
          case 'gold':
            goldEggsCaught++;
            totalScore += gameConfig?.egg.points.gold ?? 0;
            break;
          case 'black':
            blackEggsCaught++;
            totalScore = 0;
            break;
        }
        return true;
      } else {
        console.log(
          'Failed to catch egg',
          doneEggData?.id,
          doneEggData?.resultStatus
        );
        return false;
      }
    }

    // Main test loop - recursively catch eggs until game ends
    while (await catchNextEgg()) {
      // Continue catching eggs until catchNextEgg returns false
      // (which happens when game ends or no more catchable eggs)
    }

    // Verify final game state
    const currentScore = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getGameLevelScore() ?? 0;
    });

    const isGameLevelDone = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      const gameLevel = testAPI?.gameLevel;
      return gameLevel?.getSnapshot().matches('Done');
    });

    expect(isGameLevelDone).toBe(true);
    expect(currentScore).toEqual(totalScore);
  });
});
