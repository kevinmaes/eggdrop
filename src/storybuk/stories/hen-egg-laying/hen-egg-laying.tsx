import { useEffect, useRef, useState, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import henSpriteData from '../../../images/hen.sprite.json';

import henEggLayingMachine from './hen-egg-laying.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Hen Egg Laying Component
 *
 * Displays a hen that transitions between idle and egg-laying states.
 * The hen stays stationary (no X-axis movement) but changes sprite frames
 * to show different laying positions.
 *
 * States:
 * - Idle: Shows forward.png (normal hen facing forward)
 * - Laying: Randomly shows one of:
 *   - back-left.png (hen from behind, left leg extended)
 *   - back-right.png (hen from behind, right leg extended)
 *   - jump-1.png (hen jumping with both legs open)
 *   - jump-2.png (hen jumping with both legs open, variation)
 *
 * Perfect for demonstrating:
 * - State-based sprite frame selection
 * - Tag-based state detection
 * - Visual feedback for state changes without movement
 */

type HenFrameName =
  | 'forward.png'
  | 'back-left.png'
  | 'back-right.png'
  | 'jump-1.png'
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

function HenEggLaying({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henEggLayingMachine>;
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
      // Cycle through laying frames in a predictable sequence
      const layingFrames: HenFrameName[] = [
        'back-left.png',
        'back-right.png',
        'jump-1.png',
        'jump-2.png',
      ];
      setFrameName(layingFrames[layingFrameIndexRef.current]);
      // Advance to next frame for next laying cycle
      layingFrameIndexRef.current =
        (layingFrameIndexRef.current + 1) % layingFrames.length;
    } else {
      // Default idle state
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

export default HenEggLaying;
