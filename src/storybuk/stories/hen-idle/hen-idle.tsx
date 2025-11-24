import { useEffect, useRef, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import henSpriteData from '../../../images/hen.sprite.json';

import { henIdleMachine } from './hen-idle.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Simplest Hen Component - Idle State Only
 *
 * Displays a single frame (forward.png) at a fixed position.
 * No animations, no state changes, just a static sprite.
 *
 * Perfect starting point for understanding:
 * - Basic Konva Image rendering
 * - Sprite sheet cropping
 * - henRef management
 * - useSelector pattern with XState
 */

function isImageRef(imageRef: unknown): imageRef is RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}

const HEN_SIZE = {
  width: 120,
  height: 120,
};

export function HenIdle({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henIdleMachine>;
}) {
  const position = useSelector(
    actorRef,
    (state) => state?.context.position ?? { x: 0, y: 0 }
  );

  const [image] = useImage('/images/hen.sprite.png');

  const henRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (isImageRef(henRef)) {
      actorRef.send({ type: 'Set henRef', henRef });
    }
  }, [actorRef, henRef]);

  if (!position) {
    return null;
  }

  // Always show the forward-facing idle frame
  const currentFrame = henSpriteData.frames['forward.png']?.frame;
  if (!currentFrame) {
    return null;
  }

  return (
    <Image
      ref={henRef}
      image={image}
      x={position.x}
      y={position.y}
      width={HEN_SIZE.width}
      height={HEN_SIZE.height}
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
    />
  );
}
