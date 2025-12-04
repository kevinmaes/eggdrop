import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chickSpriteData from '../../../images/chick.sprite.json';
import eggSpriteData from '../../../images/egg.sprite.json';

import { eggMachine } from './egg.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Component - Game Complete Demo
 *
 * Displays egg through full lifecycle:
 * - Falling: Rotating egg sprite
 * - Hatching: Chick-hatch frame (in shell)
 * - Hatching Jump: Chick jumping out
 * - Hatched: Standing chick
 * - Exiting: Running chick
 * - Splatting: Broken egg
 */

const EGG_SIZE = {
  width: 30,
  height: 30,
};

const BROKEN_EGG_SIZE = {
  width: 60,
  height: 60,
};

const CHICK_SIZE = {
  width: 60,
  height: 60,
};

export function Egg({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggMachine>;
}) {
  const { position, currentState, color, exitTargetX } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      currentState: state?.value ?? 'Idle',
      color: state?.context.color ?? 'white',
      exitTargetX: state?.context.exitTargetX ?? 0,
    })
  );

  const isIdle = currentState === 'Idle';
  const isFalling = currentState === 'Falling';
  const isLanded = currentState === 'Landed';
  const isHatching = currentState === 'Hatching';
  // Hatching Jump is now a compound state, check if it's an object with that key
  const isHatchingJump =
    typeof currentState === 'object' &&
    currentState !== null &&
    'Hatching Jump' in currentState;
  const isHatched = currentState === 'Hatched';
  const isExiting = currentState === 'Exiting';
  const isSplatting = currentState === 'Splatting';
  const isCaught = currentState === 'Caught';

  // Show egg during idle, falling, landed
  const showEgg = isIdle || isFalling || isLanded;
  // Show chick during hatch states
  const showChick = isHatching || isHatchingJump || isHatched || isExiting;
  // Show broken egg during splatting
  const showBrokenEgg = isSplatting;

  // Determine chick sprite frame
  const useJumpFrame = isHatchingJump;
  const useStandFrame = isHatched;
  const useRunFrame = isExiting;

  const [eggImage] = useImage('/images/egg.sprite.png');
  const [chickImage] = useImage('/images/chick.sprite.png');

  const eggRef = useRef<Konva.Image>(null);

  // Send ref whenever it changes (on every render where ref exists)
  useEffect(() => {
    if (eggRef.current) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  });

  // Running animation frame alternator
  const [runFrameIndex, setRunFrameIndex] = useState(0);
  useEffect(() => {
    if (useRunFrame) {
      const interval = setInterval(() => {
        setRunFrameIndex((prev) => (prev === 0 ? 1 : 0));
      }, 100);
      return () => clearInterval(interval);
    }
  }, [useRunFrame]);

  if (isCaught) {
    return null;
  }

  if (!position) {
    return null;
  }

  // Egg sprite selection based on color
  const eggFrameName = `egg-${color}.png`;
  const eggFrame = eggSpriteData.frames[eggFrameName]?.frame;

  // Broken egg sprite (in chick sprite sheet!)
  const brokenEggFrameName = `egg-broken-${color}.png`;
  const brokenEggFrame = chickSpriteData.frames[brokenEggFrameName]?.frame;

  // Chick sprite selection
  let chickFrameName = 'chick-hatch.png';
  if (useJumpFrame) {
    chickFrameName = 'chick-forward-2.png';
  } else if (useStandFrame) {
    chickFrameName = 'chick-forward-1.png';
  } else if (useRunFrame) {
    const runDirection = exitTargetX < position.x ? 'left' : 'right';
    chickFrameName = `chick-run-${runDirection}-${runFrameIndex + 1}.png`;
  }
  const chickFrame = chickSpriteData.frames[chickFrameName]?.frame;

  // Render egg
  if (showEgg && eggFrame) {
    return (
      <Image
        ref={eggRef}
        image={eggImage}
        x={position.x}
        y={position.y}
        offsetX={EGG_SIZE.width / 2}
        offsetY={EGG_SIZE.height / 2}
        width={EGG_SIZE.width}
        height={EGG_SIZE.height}
        crop={{
          x: eggFrame.x,
          y: eggFrame.y,
          width: eggFrame.w,
          height: eggFrame.h,
        }}
      />
    );
  }

  // Render chick
  if (showChick && chickFrame) {
    return (
      <Image
        ref={eggRef}
        image={chickImage}
        x={position.x}
        y={position.y}
        offsetX={CHICK_SIZE.width / 2}
        offsetY={CHICK_SIZE.height}
        width={CHICK_SIZE.width}
        height={CHICK_SIZE.height}
        crop={{
          x: chickFrame.x,
          y: chickFrame.y,
          width: chickFrame.w,
          height: chickFrame.h,
        }}
      />
    );
  }

  // Render broken egg
  if (showBrokenEgg && brokenEggFrame) {
    return (
      <Image
        ref={eggRef}
        image={chickImage}
        x={position.x}
        y={position.y}
        offsetX={BROKEN_EGG_SIZE.width / 2}
        offsetY={BROKEN_EGG_SIZE.height}
        width={BROKEN_EGG_SIZE.width}
        height={BROKEN_EGG_SIZE.height}
        rotation={0}
        crop={{
          x: brokenEggFrame.x,
          y: brokenEggFrame.y,
          width: brokenEggFrame.w,
          height: brokenEggFrame.h,
        }}
      />
    );
  }

  return null;
}
