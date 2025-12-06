import { useEffect, useRef, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';

import { eggFallingRotatingMachine } from './egg-falling-rotating.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Falling with Rotation Component - Using Invoked TweenActor Pattern
 *
 * Displays a falling egg with rotation using the same pattern as the real game.
 * The tween handles both position and rotation animation.
 * Shows the white egg sprite as it falls and rotates.
 */

function isImageRef(imageRef: unknown): imageRef is RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}

const EGG_SIZE = {
  width: 60,
  height: 60,
};

export function EggFallingRotating({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggFallingRotatingMachine>;
}) {
  const { position } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
  }));

  const [image] = useImage('/images/egg.sprite.png');

  const eggRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  if (!position) {
    return null;
  }

  // Use the white egg sprite
  const currentFrame = eggSpriteData.frames['egg-white.png']?.frame;
  if (!currentFrame) {
    return null;
  }

  return (
    <Image
      ref={eggRef}
      image={image}
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
