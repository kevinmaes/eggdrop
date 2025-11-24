import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chickSpriteData from '../../../images/chick.sprite.json';
import eggSpriteData from '../../../images/egg.sprite.json';

import { eggLandHatchExitMachine } from './egg-land-hatch-exit.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Land, Hatch, and Exit Component
 *
 * Shows complete sequence from falling egg to chick running off:
 * - Waiting/Falling: White egg falls with rotation
 * - Landed: Egg lands on ground
 * - Hatching: Shows chick in shell (chick-hatch frame)
 * - Hatched: Chick standing (chick-forward-1)
 * - Exiting: Chick runs off screen (chick-run frames)
 * - Done: Nothing visible
 */

function isImageRef(
  imageRef: unknown
): imageRef is React.RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}

const EGG_SIZE = {
  width: 60,
  height: 60,
};

const CHICK_SIZE = {
  width: 60,
  height: 60,
};

export function EggLandHatchExit({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggLandHatchExitMachine>;
}) {
  const { position, rotation, currentState, chickExitDirection } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      rotation: state?.context.rotation ?? 0,
      currentState: state?.value ?? 'Waiting',
      chickExitDirection: state?.context.chickExitDirection ?? 1,
    })
  );

  const isFalling = currentState === 'Falling';
  const isWaiting = currentState === 'Waiting';
  const isHatching = currentState === 'Hatching';
  const isHatched = currentState === 'Hatched';
  const isExiting = currentState === 'Exiting';
  const isDone = currentState === 'Done';

  const showEgg = isWaiting || isFalling;
  const showChickInShell = isHatching;
  const showChickStanding = isHatched;
  const showChickRunning = isExiting;

  const [eggImage] = useImage('/images/egg.sprite.png');
  const [chickImage] = useImage('/images/chick.sprite.png');

  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  // Animation frame for running chick
  const [chickRunFrame, setChickRunFrame] = useState(1);
  const chickAnimationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  // Animation loop for falling
  useEffect(() => {
    if (!isFalling) {
      return;
    }

    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= frameTime) {
        actorRef.send({ type: 'Update' });
        lastUpdateRef.current = timestamp;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actorRef, isFalling]);

  // Animation loop for exiting
  useEffect(() => {
    if (!isExiting) {
      return;
    }

    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= frameTime) {
        actorRef.send({ type: 'Update' });
        lastUpdateRef.current = timestamp;

        // Animate running frames
        chickAnimationFrameRef.current += 1;
        if (chickAnimationFrameRef.current >= 10) {
          setChickRunFrame((prev) => (prev === 1 ? 2 : 1));
          chickAnimationFrameRef.current = 0;
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actorRef, isExiting]);

  if (!position || isDone) {
    return null;
  }

  // Show white egg (falling or waiting)
  if (showEgg) {
    const currentFrame = eggSpriteData.frames['egg-white.png']?.frame;
    if (!currentFrame) return null;

    return (
      <Image
        ref={eggRef}
        image={eggImage}
        x={position.x}
        y={position.y}
        width={EGG_SIZE.width}
        height={EGG_SIZE.height}
        offsetX={EGG_SIZE.width / 2}
        offsetY={EGG_SIZE.height / 2}
        rotation={rotation}
        crop={{
          x: currentFrame.x,
          y: currentFrame.y,
          width: currentFrame.w,
          height: currentFrame.h,
        }}
      />
    );
  }

  // Show chick in shell (hatching)
  if (showChickInShell) {
    const chickFrameData = chickSpriteData.frames['chick-hatch.png']?.frame;
    if (!chickFrameData) return null;

    return (
      <Image
        ref={eggRef}
        image={chickImage}
        x={position.x}
        y={position.y}
        width={CHICK_SIZE.width}
        height={CHICK_SIZE.height}
        offsetX={CHICK_SIZE.width / 2}
        offsetY={CHICK_SIZE.height / 2}
        crop={{
          x: chickFrameData.x,
          y: chickFrameData.y,
          width: chickFrameData.w,
          height: chickFrameData.h,
        }}
      />
    );
  }

  // Show chick standing (hatched, brief pause)
  if (showChickStanding) {
    const chickFrameData = chickSpriteData.frames['chick-forward-1.png']?.frame;
    if (!chickFrameData) return null;

    return (
      <Image
        ref={eggRef}
        image={chickImage}
        x={position.x}
        y={position.y}
        width={CHICK_SIZE.width}
        height={CHICK_SIZE.height}
        offsetX={CHICK_SIZE.width / 2}
        offsetY={CHICK_SIZE.height / 2}
        crop={{
          x: chickFrameData.x,
          y: chickFrameData.y,
          width: chickFrameData.w,
          height: chickFrameData.h,
        }}
      />
    );
  }

  // Show chick running (exiting)
  if (showChickRunning) {
    const direction = chickExitDirection === 1 ? 'right' : 'left';
    const frameName = `chick-run-${direction}-${chickRunFrame}.png`;
    const chickFrameData =
      chickSpriteData.frames[frameName as keyof typeof chickSpriteData.frames]
        ?.frame;
    if (!chickFrameData) return null;

    return (
      <Image
        ref={eggRef}
        image={chickImage}
        x={position.x}
        y={position.y}
        width={CHICK_SIZE.width}
        height={CHICK_SIZE.height}
        offsetX={CHICK_SIZE.width / 2}
        offsetY={CHICK_SIZE.height / 2}
        crop={{
          x: chickFrameData.x,
          y: chickFrameData.y,
          width: chickFrameData.w,
          height: chickFrameData.h,
        }}
      />
    );
  }

  return null;
}
