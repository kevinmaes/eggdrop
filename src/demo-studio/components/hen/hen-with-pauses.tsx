import { useEffect, useRef, useState, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import henSpriteData from '../../../../public/images/hen.sprite.json';
import henWithPausesMachine from '../../machines/hen/hen-with-pauses.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Simplified Hen Component - With Pauses
 *
 * This component extends the back-and-forth demo by adding pause behavior.
 * When the hen reaches its destination, it stops moving (idle animation)
 * for 1-2 seconds before moving to the next target.
 *
 * NEW in this version:
 * - Idle animation when paused at destination
 *
 * SAME as back-and-forth version:
 * - useSelector pattern for state subscription
 * - Frame animation cycle for walking
 * - Sprite sheet rendering
 * - henRef management
 */

type HenFrameName =
  | 'forward.png'
  | 'walk-left-1.png'
  | 'walk-left-2.png'
  | 'walk-left-3.png'
  | 'walk-left-4.png'
  | 'walk-right-1.png'
  | 'walk-right-2.png'
  | 'walk-right-3.png'
  | 'walk-right-4.png';

function isImageRef(imageRef: unknown): imageRef is RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}

// Hardcoded size (matches DEMO_CONFIG in machine)
const HEN_SIZE = {
  width: 120,
  height: 120,
};

function HenWithPauses({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henWithPausesMachine>;
}) {
  const { position, isMoving, movingDirection, absoluteTweenSpeed } =
    useSelector(actorRef, (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      isMoving: state?.matches('Moving') ?? false,
      movingDirection: state?.context.movingDirection ?? 'none',
      absoluteTweenSpeed: Math.abs(state?.context.currentTweenSpeed ?? 0),
    }));

  const [image] = useImage('/images/hen.sprite.png');

  const henRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (isImageRef(henRef)) {
      actorRef.send({ type: 'Set henRef', henRef });
    }
  }, [actorRef, henRef]);

  const [frameName, setFrameName] = useState<HenFrameName>('forward.png');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const [animationIntervalMinMS, animationIntervalMaxMS] = [50, 750];

    if (isMoving && movingDirection !== 'none') {
      const walkFrameNames: HenFrameName[] = [
        `walk-${movingDirection}-1.png`,
        `walk-${movingDirection}-2.png`,
        `walk-${movingDirection}-3.png`,
        `walk-${movingDirection}-4.png`,
      ];

      // Set first frame immediately
      if (walkFrameNames[0]) {
        setFrameName(walkFrameNames[0]);
      }

      // Calculate interval based on tween speed
      const intervalMS = Math.max(
        animationIntervalMinMS,
        animationIntervalMaxMS - absoluteTweenSpeed * 100
      );

      interval = setInterval(() => {
        setFrameName((prevFrameName) => {
          const index = walkFrameNames.indexOf(prevFrameName);
          if (index === -1 || index === walkFrameNames.length - 1) {
            return walkFrameNames[0] as HenFrameName;
          }
          return walkFrameNames[index + 1] as HenFrameName;
        });
      }, intervalMS);
    } else {
      // When not moving (paused at destination), show idle frame
      setFrameName('forward.png');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMoving, movingDirection, absoluteTweenSpeed]);

  if (!position) {
    return null;
  }

  const currentFrame = henSpriteData.frames[frameName]?.frame;
  if (!currentFrame) {
    return null;
  }

  return (
    <Image
      ref={henRef}
      image={image}
      x={position.x}
      y={position.y}
      width={HEN_SIZE.width}
      height={HEN_SIZE.height}
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
    />
  );
}

export default HenWithPauses;
