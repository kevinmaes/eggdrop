import { test, expect } from '@playwright/test';
import { GAME_LEVEL_ACTOR_ID, LOADING_MSG } from '../src/constants';
import { type TestAPI } from '../src/test-api';
import { createLogger } from './helpers';
import { createActor, waitFor } from 'xstate';
import { chefBotMachine } from './machines/chefBot.machine';
import { GameLevelActorRef } from '../src/GameLevel/gameLevel.machine';
import { AppActorRef } from '../src/app.machine';

// Set a longer timeout for all tests in this file
test.setTimeout(300000); // 5 minutes

// Extend the Window interface to include our test API
declare global {
  interface Window {
    __TEST_API__?: TestAPI;
  }
}

test.describe('@automated Game', () => {
  // let gameConfig: GameConfig | undefined;

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
        const appActorRef = testAPI?.app;
        return appActorRef !== undefined;
      },
      { timeout: 5000 }
    );

    await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      testAPI?.app?.send({ type: 'Play' });
    });
  });

  test('should move the chef to catch eggs one after another until the level ends', async ({
    page,
  }) => {
    test.setTimeout(300000);
    const { logStep } = createLogger();

    // Create and start the chefBot first
    const chefBot = createActor(chefBotMachine, {
      input: { page },
    });
    // Start the bot and set it as test actor
    chefBot.start();

    // Now start the game
    chefBot.send({ type: 'Start' });

    const isGameLevelDoneHandle = await page.waitForFunction(() => {
      const testAPI = window.__TEST_API__;
      const appActorRef = testAPI?.app as AppActorRef;
      const gameLevelActorRef = appActorRef.system.get(
        'Game Level'
      ) as GameLevelActorRef;
      return gameLevelActorRef.getSnapshot().matches('Done');
    });
    const isGameLevelDone = await isGameLevelDoneHandle.jsonValue();

    // logStep(`Final score: ${currentScore}`);
    // logStep(`Game level done: ${isGameLevelDone}`);
    // logStep(
    //   `Total eggs caught: ${totalEggsCaught} (White: ${whiteEggsCaught}, Gold: ${goldEggsCaught}, Black: ${blackEggsCaught})`
    // );
    console.log('isGameLevelDone', isGameLevelDone);

    expect(isGameLevelDone).toBe(true);

    await waitFor(chefBot, (state) => state.matches('Done'));
    console.log('chefBot snapshot value', chefBot.getSnapshot().value);
    expect(chefBot.getSnapshot().matches('Done')).toBe(true);

    const totalScore = await page.evaluate(() => {
      const testAPI = window.__TEST_API__;
      const totalScore = testAPI?.getGameLevelScore();
      return totalScore;
    });

    const { expectedScore } = chefBot.getSnapshot().context;
    expect(expectedScore).toEqual(totalScore);
  });
});
