import { useEffect, useRef, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';

import { eggIdleMachine } from './egg-idle.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Idle Component
 *
 * Displays a stationary egg sprite - the simplest possible egg component.
 * No animation, no state transitions, just a white egg at a fixed position.
 *
 * Perfect for:
 * - Demonstrating basic actor setup
 * - Reference for sprite positioning
 * - Understanding the Konva integration pattern
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

export function EggIdle({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggIdleMachine>;
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

  // Three static eggs vertically stacked at full size
  // White egg on top, gold in middle, black on bottom
  const verticalSpacing = 150; // Space between eggs

  const whiteFrame = eggSpriteData.frames['egg-white.png']?.frame;
  const goldFrame = eggSpriteData.frames['egg-gold.png']?.frame;
  const blackFrame = eggSpriteData.frames['egg-black.png']?.frame;

  if (!whiteFrame || !goldFrame || !blackFrame) {
    return null;
  }

  return (
    <>
      {/* White egg - top */}
      <Image
        image={image}
        x={position.x}
        y={position.y - verticalSpacing}
        width={EGG_SIZE.width}
        height={EGG_SIZE.height}
        crop={{
          x: whiteFrame.x,
          y: whiteFrame.y,
          width: whiteFrame.w,
          height: whiteFrame.h,
        }}
      />

      {/* Gold egg - middle (at original position) */}
      <Image
        ref={eggRef}
        image={image}
        x={position.x}
        y={position.y}
        width={EGG_SIZE.width}
        height={EGG_SIZE.height}
        crop={{
          x: goldFrame.x,
          y: goldFrame.y,
          width: goldFrame.w,
          height: goldFrame.h,
        }}
      />

      {/* Black egg - bottom */}
      <Image
        image={image}
        x={position.x}
        y={position.y + verticalSpacing}
        width={EGG_SIZE.width}
        height={EGG_SIZE.height}
        crop={{
          x: blackFrame.x,
          y: blackFrame.y,
          width: blackFrame.w,
          height: blackFrame.h,
        }}
      />
    </>
  );
}
