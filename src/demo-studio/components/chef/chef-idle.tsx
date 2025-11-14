import { useEffect, useRef, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chefSpriteData from '../../../../public/images/chef.sprite.json';
import chefIdleMachine from '../../machines/chef/chef-idle.machine';

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
  width: 100,
  height: 100,
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

  // Show the forward-facing idle frame
  const currentFrame = chefSpriteData.frames['forward.png']?.frame;
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

export default ChefIdle;
