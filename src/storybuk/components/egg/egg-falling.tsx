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
 * Uses window.requestAnimationFrame to continuously update position.
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
  const { position, isFalling } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    isFalling: state?.matches('Falling') ?? false,
  }));

  const [image] = useImage('/images/egg.sprite.png');

  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  // Listen for when actor is started by Storybuk (.start() is called)
  // and send the Start event to transition from Waiting to Falling
  useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
      // When actor transitions to active and we haven't sent Start yet
      if (!hasStartedRef.current && snapshot.status === 'active') {
        hasStartedRef.current = true;
        actorRef.send({ type: 'Start' });
      }
    });

    return () => {
      subscription.unsubscribe();
      hasStartedRef.current = false;
    };
  }, [actorRef]);

  // Animation loop with frame rate limiting (60 FPS)
  // Only runs when in Falling state
  useEffect(() => {
    if (!isFalling) {
      return;
    }

    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= frameTime) {
        actorRef.send({ type: 'Update' });
        lastUpdateRef.current = timestamp;
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actorRef, isFalling]);

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
