import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';

import { eggFallingAndBreakingMachine } from './egg-falling-and-breaking.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Falling and Breaking Component
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

export function EggFallingAndBreaking({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggFallingAndBreakingMachine>;
}) {
  const { position, currentState } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    currentState: state?.value ?? 'Waiting',
  }));

  const isSplatting = currentState === 'Splatting';

  const [eggImage] = useImage('/images/egg.sprite.png');
  const [brokenEggImage] = useImage('/images/egg-broken-white.png');

  const eggRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

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
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
    />
  );
}
