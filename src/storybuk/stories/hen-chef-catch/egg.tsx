import { useEffect, useRef, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';

import { eggMachine } from './egg.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Falling, Rotating Egg Component
 *
 * Displays an egg that falls with tween-based animation and rotation.
 * Supports white and gold egg colors.
 */

function isRefObject(ref: unknown): ref is RefObject<Konva.Image> {
  return ref !== null && typeof ref === 'object' && 'current' in ref;
}

const EGG_SIZE = {
  width: 30,
  height: 30,
};

export function Egg({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggMachine>;
}) {
  const { position, color } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    color: state?.context.color ?? 'white',
  }));

  const [image] = useImage('/images/egg.sprite.png');

  const eggRef = useRef<Konva.Image>(null);

  // Send ref to machine on mount - the machine will check when ref.current is populated
  useEffect(() => {
    if (isRefObject(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef]);

  if (!position) {
    return null;
  }

  // Select egg sprite based on color
  const frameName = color === 'gold' ? 'egg-gold.png' : 'egg-white.png';
  const currentFrame = eggSpriteData.frames[frameName]?.frame;
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
