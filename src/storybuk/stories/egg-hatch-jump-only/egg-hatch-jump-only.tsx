import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chickSpriteData from '../../../../public/images/chick.sprite.json';
import eggHatchJumpOnlyMachine from './egg-hatch-jump-only.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Hatching Jump Only Component
 *
 * Focuses on the jump animation:
 * - Chick starts in shell on ground
 * - Hatching pause (300ms)
 * - Jumps up and bounces down
 * - Brief pause in standing pose
 * - Done
 */

function isImageRef(
  imageRef: unknown
): imageRef is React.RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}

const CHICK_SIZE = {
  width: 60,
  height: 60,
};

function EggHatchJumpOnly({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggHatchJumpOnlyMachine>;
}) {
  const { position, currentState } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    currentState: state?.value ?? 'Waiting',
  }));

  const isJumpingUp =
    typeof currentState === 'object' &&
    'Hatching Jump' in currentState &&
    currentState['Hatching Jump'] === 'Jumping Up';
  const isBouncingDown =
    typeof currentState === 'object' &&
    'Hatching Jump' in currentState &&
    currentState['Hatching Jump'] === 'Bouncing Down';

  const isHatched = currentState === 'Hatched';

  // Sprite selection
  const useJumpingFrame = isJumpingUp || isBouncingDown;
  const useStandingFrame = isHatched;

  const [chickImage] = useImage('/images/chick.sprite.png');
  const chickRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  useEffect(() => {
    if (isImageRef(chickRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef: chickRef });
    }
  }, [actorRef, chickRef]);

  useEffect(() => {
    const subscription = actorRef.subscribe((snapshot) => {
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

  useEffect(() => {
    const needsAnimation = isJumpingUp || isBouncingDown;

    if (!needsAnimation) {
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
  }, [actorRef, isJumpingUp, isBouncingDown]);

  if (!position) {
    return null;
  }

  let frameName = 'chick-hatch.png';

  if (useJumpingFrame) {
    frameName = 'chick-forward-2.png';
  } else if (useStandingFrame) {
    frameName = 'chick-forward-1.png';
  }

  const chickFrameData =
    chickSpriteData.frames[frameName as keyof typeof chickSpriteData.frames]
      ?.frame;
  if (!chickFrameData) return null;

  return (
    <Image
      ref={chickRef}
      image={chickImage}
      x={position.x}
      y={position.y}
      width={CHICK_SIZE.width}
      height={CHICK_SIZE.height}
      offsetX={CHICK_SIZE.width / 2}
      offsetY={CHICK_SIZE.height / 2}
      crop={{
        x: chickFrameData.x,
        y: chickFrameData.y,
        width: chickFrameData.w,
        height: chickFrameData.h,
      }}
    />
  );
}

export default EggHatchJumpOnly;
