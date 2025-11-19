import { useEffect, useRef, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chefSpriteData from '../../../images/chef.sprite.json';

import chefIdleMachine from './chef-idle.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Simplest Chef Component - Idle State Only
 *
 * Displays a single idle chef sprite at a fixed position.
 * Based on hen-idle pattern.
 */

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

function ChefIdle({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof chefIdleMachine>;
}) {
  const position = useSelector(
    actorRef,
    (state) => state?.context.position ?? { x: 0, y: 0 }
  );

  const [image] = useImage('/images/chef.sprite.png');

  const chefRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (isImageRef(chefRef)) {
      actorRef.send({ type: 'Set chefRef', chefRef });
    }
  }, [actorRef, chefRef]);

  if (!position) {
    return null;
  }

  // Use leg-1 instead of catching to avoid showing steam from pot
  const currentFrame = chefSpriteData.frames['chef-leg-1.png']?.frame;
  if (!currentFrame) {
    return null;
  }

  // Match the facing direction of other chef stories
  const scaleX = -1;

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

export default ChefIdle;
