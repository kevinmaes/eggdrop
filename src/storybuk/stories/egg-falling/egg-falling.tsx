import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';
import { isImageRef } from '../../../types';

import { eggFallingMachine } from './egg-falling.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Falling Component - Using Invoked TweenActor Pattern
 *
 * Displays a falling egg using the same pattern as the real game.
 * The Konva.Tween (invoked via tweenActor) handles all animation,
 * so this component just needs to:
 * 1. Send the eggRef to the machine
 * 2. Display the egg sprite
 *
 * No RAF loop needed - the tween handles everything!
 */

const EGG_SIZE = {
  width: 60,
  height: 60,
};

export function EggFalling({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggFallingMachine>;
}) {
  const position = useSelector(actorRef, (state) => state.context.position);

  const [image] = useImage('/images/egg.sprite.png');

  const eggRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef]);

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
