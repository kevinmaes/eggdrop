import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';

import { eggSplatMachine } from './egg-splat.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Splat Component
 *
 * Displays an egg that falls and splats on the ground.
 * Uses window.requestAnimationFrame to continuously update position.
 * Shows white egg while falling, then switches to broken egg sprite on splat.
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

const BROKEN_EGG_SIZE = {
  width: 90,
  height: 60,
};

export function EggSplat({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggSplatMachine>;
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
  const isSplatting = currentState === 'Splatting';

  const [eggImage] = useImage('/images/egg.sprite.png');
  const [brokenEggImage] = useImage('/images/egg-broken-white.png');

  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  // Animation loop with frame rate limiting (60 FPS)
  // Only runs when in Falling state
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

  // Show broken egg when splatting
  if (isSplatting) {
    return (
      <Image
        ref={eggRef}
        image={brokenEggImage}
        x={position.x}
        y={position.y}
        width={BROKEN_EGG_SIZE.width}
        height={BROKEN_EGG_SIZE.height}
      />
    );
  }

  // Show white egg while falling or waiting
  const currentFrame = eggSpriteData.frames['egg-white.png']?.frame;
  if (!currentFrame) {
    return null;
  }

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
