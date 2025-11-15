import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chickSpriteData from '../../../../public/images/chick.sprite.json';
import eggSpriteData from '../../../../public/images/egg.sprite.json';
import eggHatchGameAccurateMachine from '../../machines/egg/egg-hatch-game-accurate.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Game-Accurate Egg Hatch Component
 *
 * Matches the exact visual sequence from the real game:
 * - White egg falls with rotation
 * - Lands and shows chick-hatch frame
 * - Chick jumps up and bounces down
 * - Brief pause in hatched pose
 * - Chick slides to exit (linear movement, not animated frames)
 *
 * Sprite usage:
 * - Falling: egg-white.png (rotating)
 * - Hatching/Hatched/Exiting: chick-hatch.png (no frame animation during exit)
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

const CHICK_SIZE = {
  width: 60,
  height: 60,
};

function EggHatchGameAccurate({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggHatchGameAccurateMachine>;
}) {
  const { position, rotation, currentState, chickExitDirection } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      rotation: state?.context.rotation ?? 0,
      currentState: state?.value ?? 'Waiting',
      chickExitDirection: state?.context.chickExitDirection ?? 1,
    })
  );

  // Determine if we're in a nested state
  const isJumpingUp =
    typeof currentState === 'object' &&
    'Hatching Jump' in currentState &&
    currentState['Hatching Jump'] === 'Jumping Up';
  const isBouncingDown =
    typeof currentState === 'object' &&
    'Hatching Jump' in currentState &&
    currentState['Hatching Jump'] === 'Bouncing Down';

  const isFalling = currentState === 'Falling';
  const isWaiting = currentState === 'Waiting';
  const isHatching = currentState === 'Hatching';
  const isHatched = currentState === 'Hatched';
  const isExiting = currentState === 'Exiting';

  // Show egg during these states
  const showEgg = isWaiting || isFalling;
  // Show chick during these states
  const showChick =
    isHatching || isJumpingUp || isBouncingDown || isHatched || isExiting;

  // Sprite usage matches game exactly:
  // - Hatching: chick-hatch.png (in shell)
  // - Hatching Jump (jumping/bouncing): chick-forward-2.png (out of shell)
  // - Hatched: chick-forward-1.png (standing)
  // - Exiting: chick-run frames (animated)
  const useJumpingFrame = isJumpingUp || isBouncingDown;
  const useStandingFrame = isHatched;
  const useRunningFrame = isExiting;

  const [eggImage] = useImage('/images/egg.sprite.png');
  const [chickImage] = useImage('/images/chick.sprite.png');

  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  // Animation frame for running chick (alternates between 1 and 2)
  const [chickRunFrame, setChickRunFrame] = useState(1);
  const chickAnimationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  // Listen for when actor is started
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

  // Animation loop for states that need continuous updates
  useEffect(() => {
    const needsAnimation =
      isFalling || isJumpingUp || isBouncingDown || isExiting;

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

        // Animate running frames (alternate every 10 updates)
        if (isExiting) {
          chickAnimationFrameRef.current += 1;
          if (chickAnimationFrameRef.current >= 10) {
            setChickRunFrame((prev) => (prev === 1 ? 2 : 1));
            chickAnimationFrameRef.current = 0;
          }
        }
      }

      animationFrameRef.current = window.requestAnimationFrame(animate);
    };

    animationFrameRef.current = window.requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        window.cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actorRef, isFalling, isJumpingUp, isBouncingDown, isExiting]);

  if (!position) {
    return null;
  }

  // Show white egg (falling or waiting)
  if (showEgg) {
    const currentFrame = eggSpriteData.frames['egg-white.png']?.frame;
    if (!currentFrame) return null;

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
        rotation={rotation}
        crop={{
          x: currentFrame.x,
          y: currentFrame.y,
          width: currentFrame.w,
          height: currentFrame.h,
        }}
      />
    );
  }

  // Show chick with appropriate frame (matches game exactly)
  if (showChick) {
    let frameName = 'chick-hatch.png'; // Default

    if (useJumpingFrame) {
      // During jump/bounce: out of shell, jumping pose
      frameName = 'chick-forward-2.png';
    } else if (useStandingFrame) {
      // After landing: standing pose
      frameName = 'chick-forward-1.png';
    } else if (useRunningFrame) {
      // During exit: animated running
      const direction = chickExitDirection === 1 ? 'right' : 'left';
      frameName = `chick-run-${direction}-${chickRunFrame}.png`;
    }

    const chickFrameData =
      chickSpriteData.frames[frameName as keyof typeof chickSpriteData.frames]
        ?.frame;
    if (!chickFrameData) return null;

    return (
      <Image
        ref={eggRef}
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

  return null;
}

export default EggHatchGameAccurate;
