import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chickSpriteData from '../../../images/chick.sprite.json';
import eggSpriteData from '../../../images/egg.sprite.json';

import { eggLandHatchStandingMachine } from './egg-land-hatch-standing.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Land, Hatch, and Stand Component
 *
 * Shows egg falling and landing, then hatching to show chick in shell,
 * then showing standing chick alone:
 * - White egg falls with rotation
 * - Lands on ground
 * - Shows chick-hatch frame (chick in shell)
 * - Shows chick-1 frame (standing chick)
 * - Done
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

export function EggLandHatchStanding({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggLandHatchStandingMachine>;
}) {
  const { position, rotation, currentState } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      rotation: state?.context.rotation ?? 0,
      currentState: state?.value ?? 'Waiting',
    })
  );

  const isFalling = currentState === 'Falling';
  const isWaiting = currentState === 'Waiting';
  const isHatching = currentState === 'Hatching';
  const isHatched = currentState === 'Hatched' || currentState === 'Done';

  const showEgg = isWaiting || isFalling;
  const showChickInShell = isHatching;
  const showStandingChick = isHatched;

  const [eggImage] = useImage('/images/egg.sprite.png');
  const [chickImage] = useImage('/images/chick.sprite.png');

  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

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

  if (!position) {
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

  // Show standing chick (hatched)
  if (showStandingChick) {
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

  return null;
}
