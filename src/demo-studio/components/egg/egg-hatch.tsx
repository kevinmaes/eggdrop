import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../../public/images/egg.sprite.json';
import chickSpriteData from '../../../../public/images/chick.sprite.json';
import eggHatchMachine from '../../machines/egg/egg-hatch.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Hatch Component
 *
 * Shows complete egg lifecycle:
 * - White egg falls with rotation
 * - Lands on ground
 * - Hatches into chick
 * - Chick runs off screen
 *
 * Sprite animations:
 * - Falling: egg-white.png (rotating)
 * - Hatching: chick-hatch.png (stationary)
 * - Running: chick-run-left/right animated
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

function EggHatch({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggHatchMachine>;
}) {
  const { position, rotation, currentState, chickRunDirection } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      rotation: state?.context.rotation ?? 0,
      currentState: state?.value ?? 'Waiting',
      chickRunDirection: (state?.context.chickRunDirection ?? 1) as number,
    })
  );

  const isFalling = currentState === 'Falling';
  const isWaiting = currentState === 'Waiting';
  const isHatching = currentState === 'Hatching';
  const isChickRunning = currentState === 'ChickRunning';

  const [eggImage] = useImage('/images/egg.sprite.png');
  const [chickImage] = useImage('/images/chick.sprite.png');

  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  // Animation frame for running chick (alternates between 1 and 2)
  const [chickFrame, setChickFrame] = useState(1);
  const chickAnimationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  // Listen for when actor is started by DemoStudio (.start() is called)
  // and send the Start event to transition from Waiting to Falling
  useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
      if (!hasStartedRef.current && snapshot.status === 'active') {
        hasStartedRef.current = true;
        actorRef.send({ type: 'Start' });
      }
    });

    return () => {
      subscription.unsubscribe();
      hasStartedRef.current = false;
    };
  }, [actorRef]);

  // Animation loop for falling and chick running (60 FPS)
  useEffect(() => {
    if (!isFalling && !isChickRunning) {
      return;
    }

    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= frameTime) {
        actorRef.send({ type: 'Update' });
        lastUpdateRef.current = timestamp;

        // Animate chick running (alternate frames every 10 updates for visible animation)
        if (isChickRunning) {
          chickAnimationFrameRef.current += 1;
          if (chickAnimationFrameRef.current >= 10) {
            setChickFrame((prev) => (prev === 1 ? 2 : 1));
            chickAnimationFrameRef.current = 0;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actorRef, isFalling, isChickRunning]);

  if (!position) {
    return null;
  }

  // Show hatching chick (stationary chick emerging from egg)
  if (isHatching) {
    const hatchFrame = chickSpriteData.frames['chick-hatch.png']?.frame;
    if (!hatchFrame) return null;

    return (
      <Image
        ref={eggRef}
        image={chickImage}
        x={position.x}
        y={position.y}
        width={CHICK_SIZE.width}
        height={CHICK_SIZE.height}
        crop={{
          x: hatchFrame.x,
          y: hatchFrame.y,
          width: hatchFrame.w,
          height: hatchFrame.h,
        }}
      />
    );
  }

  // Show running chick with animated frames
  if (isChickRunning) {
    const direction = chickRunDirection === 1 ? 'right' : 'left';
    const frameName = `chick-run-${direction}-${chickFrame}.png`;
    const runFrame = chickSpriteData.frames[frameName]?.frame;
    if (!runFrame) return null;

    return (
      <Image
        ref={eggRef}
        image={chickImage}
        x={position.x}
        y={position.y}
        width={CHICK_SIZE.width}
        height={CHICK_SIZE.height}
        crop={{
          x: runFrame.x,
          y: runFrame.y,
          width: runFrame.w,
          height: runFrame.h,
        }}
      />
    );
  }

  // Show white egg while falling or waiting (with rotation)
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

export default EggHatch;
