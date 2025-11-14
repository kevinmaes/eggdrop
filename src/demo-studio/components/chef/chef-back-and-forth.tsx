import { useEffect, useRef, useState, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chefSpriteData from '../../../../public/images/chef.sprite.json';
import chefBackAndForthMachine from '../../machines/chef/chef-back-and-forth.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Chef Component - Back and Forth Movement
 *
 * Based on hen-back-and-forth pattern with chef sprite animations.
 */

type ChefFrameName = 'chef-catching.png' | 'chef-leg-1.png' | 'chef-leg-2.png';

function isImageRef(imageRef: unknown): imageRef is RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}

const CHEF_SIZE = {
  width: 100,
  height: 100,
};

function ChefBackAndForth({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof chefBackAndForthMachine>;
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
      // Chef only has 2 walking frames (leg-1 and leg-2), no directional variants
      const walkFrameNames: ChefFrameName[] = [
        'chef-leg-1.png',
        'chef-leg-2.png',
      ];

      // Set first frame immediately
      setFrameName(walkFrameNames[0]!);

      // Calculate interval based on tween speed
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
      setFrameName('chef-catching.png');
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

  return (
    <Image
      ref={chefRef}
      image={image}
      x={position.x}
      y={position.y}
      width={CHEF_SIZE.width}
      height={CHEF_SIZE.height}
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
    />
  );
}

export default ChefBackAndForth;
