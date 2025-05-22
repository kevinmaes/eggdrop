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

test.describe('Game', () => {
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

  test('should move the chef to catch one catchable egg', async ({ page }) => {
    let testAPI: TestAPI | undefined;

    // Start the game
    await page.evaluate(() => {
      testAPI = window.__TEST_API__;
      testAPI?.app?.send({ type: 'Play' });
    });

    // Get the initial score before catching the egg
    const initialScore = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getGameLevelScore() ?? 0;
    });

    // Wait for the first egg actor to be added to the test API
    const firstCatchableEgg = await page.waitForFunction(
      () => {
        // console.log('checking for first egg id');
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
      { timeout: 20_000 }
    );
    const firstCatchableEggData = await firstCatchableEgg.jsonValue();

    if (typeof firstCatchableEggData === 'undefined') {
      throw new Error('First catchable egg data is undefined');
    }

    const firstCatchableEggXPos = firstCatchableEggData.position.x;

    const chefXPos = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPosition()?.x;
    });

    if (!chefXPos) {
      throw new Error('Chef X position is undefined');
    }

    // Determine which direction to move the Chef
    const keyToPress =
      firstCatchableEggXPos < chefXPos ? 'ArrowLeft' : 'ArrowRight';
    const moveDirection: 'right' | 'left' =
      keyToPress === 'ArrowRight' ? 'right' : 'left';

    // Assess the chef's X position
    const chefPotRimHitX = await page.evaluate(
      (direction: 'right' | 'left') => {
        const testAPI = window.__TEST_API__;
        return testAPI?.getChefPotRimCenterHitX(direction);
      },
      moveDirection
    );

    if (!chefPotRimHitX) {
      throw new Error('Chef X position is undefined');
    }

    await page.keyboard.down(keyToPress);

    // Wait for the Chef to reach the first egg actor's xPosition
    await page.waitForFunction(
      ({
        firstCatchableEggXPos,
        direction,
      }: {
        firstCatchableEggXPos: number;
        direction: 'right' | 'left';
      }) => {
        const testAPI = window.__TEST_API__;
        const potRimHitX = testAPI?.getChefPotRimCenterHitX(direction);

        if (!potRimHitX) {
          throw new Error('Chef pot rim hit X is undefined');
        }

        return direction === 'right'
          ? potRimHitX >= firstCatchableEggXPos
          : potRimHitX <= firstCatchableEggXPos;
      },
      { firstCatchableEggXPos, direction: moveDirection },
      { timeout: 5000 }
    );

    // Release the key
    await page.keyboard.up(keyToPress);

    // Wait until the egg is caught
    await page.waitForFunction(
      eggRefId => {
        const testAPI = window.__TEST_API__;
        const gameLevel = testAPI?.gameLevel;
        if (!gameLevel) return false;
        const eggActorRefs = gameLevel.getSnapshot().context.eggActorRefs;
        const eggRef = eggActorRefs.find(ref => ref.id === eggRefId);
        if (!eggRef) return true;
      },
      firstCatchableEggData.id,
      { timeout: 10000 }
    );

    // Get the score after catching the egg
    const finalScore = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getGameLevelScore() ?? 0;
    });

    // Assert that the score increased
    expect(finalScore).toBeGreaterThan(initialScore);
  });

  test('should move the chef to catch two catchable eggs in a row', async ({
    page,
  }) => {
    let testAPI: TestAPI | undefined;

    let chefXPos: number | undefined;
    let keyToPress: string | undefined;
    let moveDirection: 'right' | 'left' | undefined;
    let chefPotRimHitX: number | undefined;

    // Start the game
    await page.evaluate(() => {
      testAPI = window.__TEST_API__;
      testAPI?.app?.send({ type: 'Play' });
    });

    // Get the initial score before catching the egg
    const initialScore = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getGameLevelScore() ?? 0;
    });

    // Catch the first egg

    // Wait for the first egg actor to be added to the test API
    const firstCatchableEgg = await page.waitForFunction(
      () => {
        // console.log('checking for first egg id');
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
      { timeout: 20_000 }
    );
    const firstCatchableEggData = await firstCatchableEgg.jsonValue();

    if (typeof firstCatchableEggData === 'undefined') {
      throw new Error('First catchable egg data is undefined');
    }

    const firstCatchableEggXPos = firstCatchableEggData.position.x;

    chefXPos = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPosition()?.x;
    });

    if (!chefXPos) {
      throw new Error('Chef X position is undefined');
    }

    // Determine which direction to move the Chef
    keyToPress = firstCatchableEggXPos < chefXPos ? 'ArrowLeft' : 'ArrowRight';
    moveDirection = keyToPress === 'ArrowRight' ? 'right' : 'left';

    // Assess the chef's X position
    chefPotRimHitX = await page.evaluate((direction: 'right' | 'left') => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPotRimCenterHitX(direction);
    }, moveDirection);

    if (!chefPotRimHitX) {
      throw new Error('Chef X position is undefined');
    }

    await page.keyboard.down(keyToPress);

    // Wait for the Chef to reach the first egg actor's xPosition
    await page.waitForFunction(
      ({
        firstCatchableEggXPos,
        direction,
      }: {
        firstCatchableEggXPos: number;
        direction: 'right' | 'left';
      }) => {
        const testAPI = window.__TEST_API__;
        const potRimHitX = testAPI?.getChefPotRimCenterHitX(direction);

        if (!potRimHitX) {
          throw new Error('Chef pot rim hit X is undefined');
        }

        return direction === 'right'
          ? potRimHitX >= firstCatchableEggXPos
          : potRimHitX <= firstCatchableEggXPos;
      },
      { firstCatchableEggXPos, direction: moveDirection },
      { timeout: 5000 }
    );

    // Release the key
    await page.keyboard.up(keyToPress);

    // Wait until the egg is caught
    await page.waitForFunction(
      eggRefId => {
        const testAPI = window.__TEST_API__;
        const gameLevel = testAPI?.gameLevel;
        if (!gameLevel) return false;
        const eggActorRefs = gameLevel.getSnapshot().context.eggActorRefs;
        const eggRef = eggActorRefs.find(ref => ref.id === eggRefId);
        if (!eggRef) return true;
      },
      firstCatchableEggData.id,
      { timeout: 10000 }
    );

    // Catch the second egg
    // Choose the second egg
    // Wait for the first egg actor to be added to the test API
    const secondCatchableEgg = await page.waitForFunction(
      () => {
        // console.log('checking for first egg id');
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
      { timeout: 20_000 }
    );
    const secondCatchableEggData = await secondCatchableEgg.jsonValue();

    if (typeof secondCatchableEggData === 'undefined') {
      throw new Error('First catchable egg data is undefined');
    }

    const secondCatchableEggXPos = secondCatchableEggData.position.x;

    chefXPos = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPosition()?.x;
    });

    if (!chefXPos) {
      throw new Error('Chef X position is undefined');
    }

    // Determine which direction to move the Chef
    keyToPress = secondCatchableEggXPos < chefXPos ? 'ArrowLeft' : 'ArrowRight';
    moveDirection = keyToPress === 'ArrowRight' ? 'right' : 'left';

    // Assess the chef's X position
    chefPotRimHitX = await page.evaluate((direction: 'right' | 'left') => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getChefPotRimCenterHitX(direction);
    }, moveDirection);

    if (!chefPotRimHitX) {
      throw new Error('Chef X position is undefined');
    }

    await page.keyboard.down(keyToPress);

    // Wait for the Chef to reach the first egg actor's xPosition
    await page.waitForFunction(
      ({
        firstCatchableEggXPos,
        direction,
      }: {
        firstCatchableEggXPos: number;
        direction: 'right' | 'left';
      }) => {
        const testAPI = window.__TEST_API__;
        const potRimHitX = testAPI?.getChefPotRimCenterHitX(direction);

        if (!potRimHitX) {
          throw new Error('Chef pot rim hit X is undefined');
        }

        return direction === 'right'
          ? potRimHitX >= firstCatchableEggXPos
          : potRimHitX <= firstCatchableEggXPos;
      },
      { firstCatchableEggXPos, direction: moveDirection },
      { timeout: 5000 }
    );

    // Release the key
    await page.keyboard.up(keyToPress);

    // console.log('eggRefId', firstCatchableEggData.id);

    // Wait until the egg is caught
    await page.waitForFunction(
      eggRefId => {
        const testAPI = window.__TEST_API__;
        const gameLevel = testAPI?.gameLevel;
        if (!gameLevel) return false;
        const eggActorRefs = gameLevel.getSnapshot().context.eggActorRefs;
        const eggRef = eggActorRefs.find(ref => ref.id === eggRefId);
        if (!eggRef) return true;
      },
      firstCatchableEggData.id,
      { timeout: 10000 }
    );

    // Get the score after catching the egg
    const finalScore = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      return testAPI?.getGameLevelScore() ?? 0;
    });

    // Assert that the score increased
    expect(finalScore).toBeGreaterThan(initialScore);
  });

  test('should move the chef to catch eggs one after another until the level ends', async ({
    page,
  }) => {
    test.setTimeout(300000); // 5 minutes for this specific test
    // let testAPI: TestAPI | undefined;
    let whiteEggsCaught = 0;
    let goldEggsCaught = 0;
    let blackEggsCaught = 0;
    let totalEggsCaught = 0;
    let totalScore = 0;

    // Start the game
    await page.evaluate(() => {
      window.__TEST_API__?.app?.send({ type: 'Play' });
    });

    // Get the initial score before catching any eggs
    // let previousScore = await page.evaluate(() => {
    //   const testAPI = window.__TEST_API__;
    //   return testAPI?.getGameLevelScore() ?? 0;
    // });

    // Loop until the gameLevel exits the Playing state
    while (true) {
      // Check if the gameLevel is still in the Playing state
      const isPlaying = await page.evaluate(() => {
        const testAPI = window.__TEST_API__;
        const gameLevel = testAPI?.gameLevel;
        return gameLevel?.getSnapshot().matches('Playing');
      });
      if (!isPlaying) break;

      // Wait for the next catchable egg
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
      if (!catchableEggData) break;

      const eggXPos = catchableEggData.position.x;

      // Get chef's current X position
      const chefXPos = await page.evaluate(() => {
        const testAPI = window.__TEST_API__;
        return testAPI?.getChefPosition()?.x;
      });
      if (typeof chefXPos !== 'number') break;

      // Determine which direction to move the Chef
      const keyToPress = eggXPos < chefXPos ? 'ArrowLeft' : 'ArrowRight';
      const moveDirection: 'right' | 'left' =
        keyToPress === 'ArrowRight' ? 'right' : 'left';

      // Assess the chef's X position
      const chefPotRimHitX = await page.evaluate(
        (direction: 'right' | 'left') => {
          const testAPI = window.__TEST_API__;
          return testAPI?.getChefPotRimCenterHitX(direction);
        },
        moveDirection
      );
      if (!chefPotRimHitX) break;

      await page.keyboard.down(keyToPress);

      // Wait for the Chef to reach the egg's xPosition
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

      // Release the key to keep the chef at its present position
      await page.keyboard.up(keyToPress);

      // Wait until the egg is caught
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
        { timeout: 6_000 }
      );
      const doneEggData = await doneEggHandle.jsonValue();
      if (doneEggData !== null) {
        if (doneEggData.resultStatus === 'Caught') {
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
        } else {
          console.log(
            'Failed to catch egg',
            doneEggData?.id,
            doneEggData?.resultStatus
          );
          continue;
        }
      }
    }

    // Get the score after catching the egg
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
