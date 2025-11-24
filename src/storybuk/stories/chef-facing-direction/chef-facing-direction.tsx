import { useEffect, useRef, useState, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chefSpriteData from '../../../images/chef.sprite.json';

import { chefFacingDirectionMachine } from './chef-facing-direction.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Chef Component - Facing Direction
 *
 * Chef moves back and forth and faces the direction of movement.
 * Uses scaleX to flip the sprite horizontally since chef has no directional frames.
 */

type ChefFrameName = 'chef-catching.png' | 'chef-leg-1.png' | 'chef-leg-2.png';

function isImageRef(imageRef: unknown): imageRef is RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}

const CHEF_SIZE = {
  width: 344,
  height: 344,
};

export function ChefFacingDirection({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof chefFacingDirectionMachine>;
}) {
  const { position, isMoving, movingDirection, absoluteTweenSpeed } =
    useSelector(actorRef, (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      isMoving: state?.value === 'Moving',
      movingDirection: state?.context.movingDirection ?? 'none',
      absoluteTweenSpeed: Math.abs(state?.context.currentTweenSpeed ?? 0),
    }));

  const [image] = useImage('/images/chef.sprite.png');

  const chefRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (isImageRef(chefRef)) {
      actorRef.send({ type: 'Set chefRef', chefRef });
    }
  }, [actorRef, chefRef]);

  const [frameName, setFrameName] =
    useState<ChefFrameName>('chef-catching.png');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;
    const [animationIntervalMinMS, animationIntervalMaxMS] = [50, 750];

    if (isMoving && movingDirection !== 'none') {
      const walkFrameNames: ChefFrameName[] = [
        'chef-leg-1.png',
        'chef-leg-2.png',
      ];

      setFrameName(walkFrameNames[0]!);

      const intervalMS = Math.max(
        animationIntervalMinMS,
        animationIntervalMaxMS - absoluteTweenSpeed * 100
      );

      interval = setInterval(() => {
        setFrameName((prevFrameName) => {
          const index = walkFrameNames.indexOf(prevFrameName);
          if (index === -1 || index === walkFrameNames.length - 1) {
            return walkFrameNames[0]!;
          }
          return walkFrameNames[index + 1]!;
        });
      }, intervalMS);
    } else {
      // Use leg-1 instead of catching to avoid showing steam from pot
      setFrameName('chef-leg-1.png');
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

  const currentFrame = chefSpriteData.frames[frameName]?.frame;
  if (!currentFrame) {
    return null;
  }

  // Flip sprite horizontally when moving right (opposite of what you'd expect)
  const scaleX = movingDirection === 'right' ? -1 : 1;

  return (
    <Image
      ref={chefRef}
      image={image}
      x={position.x}
      y={position.y}
      offsetX={CHEF_SIZE.width / 2}
      width={CHEF_SIZE.width}
      height={CHEF_SIZE.height}
      scaleX={scaleX}
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
    />
  );
}
