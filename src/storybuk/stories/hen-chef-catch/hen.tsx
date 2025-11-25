import { useEffect, useRef, useState, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import henSpriteData from '../../../images/hen.sprite.json';

import { henMachine } from './hen.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Stationary Hen Component - Continuous Laying
 *
 * Displays a stationary hen that continuously lays eggs, alternating colors.
 * Shows idle sprite when waiting, and laying sprites when laying.
 */

type HenFrameName =
  | 'forward.png'
  | 'back-left.png'
  | 'back-right.png'
  | 'jump-2.png';

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

export function Hen({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henMachine>;
}) {
  const { position, isLaying } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    isLaying: state?.hasTag('laying') ?? false,
  }));

  const [image] = useImage('/images/hen.sprite.png');

  const henRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (isImageRef(henRef)) {
      actorRef.send({ type: 'Set henRef', henRef });
    }
  }, [actorRef, henRef]);

  const [frameName, setFrameName] = useState<HenFrameName>('forward.png');
  const layingFrameIndexRef = useRef(0);

  useEffect(() => {
    if (isLaying) {
      // Cycle through laying frames
      const layingFrames: HenFrameName[] = [
        'back-left.png',
        'back-right.png',
        'jump-2.png',
      ];
      setFrameName(layingFrames[layingFrameIndexRef.current] as HenFrameName);
      layingFrameIndexRef.current =
        (layingFrameIndexRef.current + 1) % layingFrames.length;
    } else {
      setFrameName('forward.png');
    }
  }, [isLaying]);

  if (!position) {
    return null;
  }

  const currentFrame = henSpriteData.frames[frameName]?.frame;
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
