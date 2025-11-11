import { useEffect, useRef, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../../public/images/egg.sprite.json';
import eggFallingMachine from '../../machines/egg/egg-falling.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Falling Component
 *
 * Displays a falling egg with gravity physics.
 * Uses requestAnimationFrame to continuously update position.
 * Shows the white egg sprite as it falls.
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

function EggFalling({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggFallingMachine>;
}) {
  const position = useSelector(
    actorRef,
    (state) => state?.context.position ?? { x: 0, y: 0 }
  );

  const [image] = useImage('/images/egg.sprite.png');

  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>();

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  // Animation loop
  useEffect(() => {
    const animate = () => {
      actorRef.send({ type: 'Update' });
      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
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
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
    />
  );
}

export default EggFalling;
