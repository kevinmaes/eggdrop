import { describe, expect, it } from 'vitest';
import { createActor, fromPromise } from 'xstate';

import { appMachine } from './app.machine';
import { getGameConfig } from './gameConfig';
import { loadingMachine } from './Loading/loading.machine';

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
  it('responds to loading status updates and completes on loader success', async () => {
    const completionDeferred = createDeferred<{
      status: { progress: number; message: string };
      gameAssets: GameAssets;
      audioLoaded: boolean;
    }>();

    const loadingTestMachine = appMachine.provide({
      actors: {
        loadingMachine: fromPromise(
          () => completionDeferred.promise
        ) as unknown as typeof loadingMachine,
      },
    });

    const actor = createActor(loadingTestMachine, {
      input: {
        gameConfig: getGameConfig(),
      },
    });

    actor.start();

    expect(actor.getSnapshot().value).toBe('Loading');
    expect(actor.getSnapshot().context.loadingStatus).toEqual({
      progress: 0,
      message: 'Initializing...',
    });

    const assets = createStubAssets();

    completionDeferred.resolve({
      status: { progress: 1, message: 'Ready!' },
      gameAssets: assets,
      audioLoaded: true,
    });

    await Promise.resolve();

    expect(actor.getSnapshot().value).toBe('Intro');
    expect(actor.getSnapshot().context.gameAssets).toEqual(assets);
    expect(actor.getSnapshot().context.loadedAudio).toBe(true);
    expect(actor.getSnapshot().context.loadingStatus.progress).toBe(1);
    expect(actor.getSnapshot().context.loadingStatus.message).toBe('Ready!');

    actor.stop();
  });
});
