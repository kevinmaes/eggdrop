import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';

import { eggFallLandOnlyMachine } from './egg-fall-land-only.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Falling + Landing Only Component - Using Tween Actor Pattern
 *
 * Demonstrates tween-based falling animation:
 * - White egg falls with rotation (handled by tween actor)
 * - Lands on ground
 * - Done
 *
 * No requestAnimationFrame needed - tween actor handles the animation.
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

export function EggFallLandOnly({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggFallLandOnlyMachine>;
}) {
  const { position } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
  }));

  const [eggImage] = useImage('/images/egg.sprite.png');
  const eggRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  if (!position) {
    return null;
  }

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
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
    />
  );
}
