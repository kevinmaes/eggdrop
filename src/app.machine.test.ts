import { describe, expect, it } from 'vitest';
import { createActor, fromPromise, waitFor } from 'xstate';

import { appMachine } from './app.machine';
import { getGameConfig } from './gameConfig';

import type { GameAssets, SpriteData } from './types/assets';

const createDeferred = <T>() => {
  let resolve: (value: T | PromiseLike<T>) => void;
  let reject: (reason?: unknown) => void;

  const promise = new Promise<T>((res, rej) => {
    resolve = res;
    reject = rej;
  });

  return {
    promise,
    resolve: resolve!,
    reject: reject!,
  };
};

const createStubSpriteData = (): SpriteData => ({
  frames: {
    default: {
      frame: { x: 0, y: 0, w: 1, h: 1 },
      rotated: false,
      trimmed: false,
      spriteSourceSize: { x: 0, y: 0, w: 1, h: 1 },
      sourceSize: { w: 1, h: 1 },
    },
  },
  meta: {
    image: 'stub.png',
    size: { w: 1, h: 1 },
  },
});

const createStubAssets = (): GameAssets => {
  const sprite = createStubSpriteData();
  return {
    ui: sprite,
    hen: sprite,
    egg: sprite,
    chick: sprite,
    chef: sprite,
  };
};

describe('appMachine loading status', () => {
  it('updates loading status messages through the loading phases', async () => {
    const fontsDeferred = createDeferred<[void, void]>();
    const spritesDeferred = createDeferred<GameAssets>();

    const loadingTestMachine = appMachine.provide({
      actors: {
        loadFonts: fromPromise(() => fontsDeferred.promise),
        loadSprites: fromPromise(() => spritesDeferred.promise),
      },
    });

    const actor = createActor(loadingTestMachine, {
      input: {
        gameConfig: getGameConfig(),
      },
    });

    actor.start();

    expect(
      actor.getSnapshot().matches({ Loading: 'Loading Fonts' })
    ).toBeTruthy();
    expect(actor.getSnapshot().context.loadingStatus).toEqual({
      progress: 0.35,
      message: 'Loading fonts...',
    });

    fontsDeferred.resolve([undefined, undefined]);
    await waitFor(actor, (state) =>
      state.matches({ Loading: 'Loading Sprites' })
    );
    expect(actor.getSnapshot().context.loadingStatus).toEqual({
      progress: 0.75,
      message: 'Loading graphics...',
    });

    spritesDeferred.resolve(createStubAssets());
    await waitFor(actor, (state) => state.matches('Intro'));

    expect(actor.getSnapshot().context.loadingStatus).toEqual({
      progress: 1,
      message: 'Ready!',
    });

    actor.stop();
  });
});
