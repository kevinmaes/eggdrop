import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../../public/images/egg.sprite.json';
import chickSpriteData from '../../../../public/images/chick.sprite.json';
import eggEnhancedHatchMachine from '../../machines/egg/egg-enhanced-hatch.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Enhanced Egg Hatch Component
 *
 * Shows detailed hatching animation sequence:
 * - White egg falls with rotation
 * - Lands and cracks (wobble animation)
 * - Chick hatches and appears
 * - Chick jumps up and bounces down
 * - Chick walks off screen with animated frames
 *
 * Sprite animations:
 * - Falling/Cracking: egg-white.png (with rotation/wobble)
 * - Hatching/Jumping: chick-hatch.png
 * - Walking: chick-forward-1/2 animated
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

function EggEnhancedHatch({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggEnhancedHatchMachine>;
}) {
  const { position, rotation, currentState, chickWalkDirection } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      rotation: state?.context.rotation ?? 0,
      currentState: state?.value ?? 'Waiting',
      chickWalkDirection: (state?.context.chickWalkDirection ?? 1) as number,
    })
  );

  const isFalling = currentState === 'Falling';
  const isWaiting = currentState === 'Waiting';
  const isCracking = currentState === 'Cracking';
  const isHatching = currentState === 'Hatching';
  const isJumpingUp = currentState === 'JumpingUp';
  const isBouncingDown = currentState === 'BouncingDown';
  const isWalking = currentState === 'Walking';

  // Show egg during these states
  const showEgg = isWaiting || isFalling || isCracking;
  // Show chick during these states
  const showChick = isHatching || isJumpingUp || isBouncingDown || isWalking;

  const [eggImage] = useImage('/images/egg.sprite.png');
  const [chickImage] = useImage('/images/chick.sprite.png');

  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>();
  const lastUpdateRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  // Animation frame for walking chick (alternates between 1 and 2)
  const [chickFrame, setChickFrame] = useState(1);
  const chickAnimationFrameRef = useRef<number>(0);

  useEffect(() => {
    if (isImageRef(eggRef)) {
      actorRef.send({ type: 'Set eggRef', eggRef });
    }
  }, [actorRef, eggRef]);

  // Listen for when actor is started by DemoStudio (.start() is called)
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

  // Animation loop for falling, cracking, jumping, and walking (60 FPS)
  useEffect(() => {
    const needsAnimation =
      isFalling || isCracking || isJumpingUp || isBouncingDown || isWalking;

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

        // Animate chick walking (alternate frames every 10 updates)
        if (isWalking) {
          chickAnimationFrameRef.current += 1;
          if (chickAnimationFrameRef.current >= 10) {
            setChickFrame((prev) => (prev === 1 ? 2 : 1));
            chickAnimationFrameRef.current = 0;
          }
        }
      }

      animationFrameRef.current = requestAnimationFrame(animate);
    };

    animationFrameRef.current = requestAnimationFrame(animate);

    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
    };
  }, [actorRef, isFalling, isCracking, isJumpingUp, isBouncingDown, isWalking]);

  if (!position) {
    return null;
  }

  // Show white egg (falling, waiting, or cracking with wobble)
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

  // Show chick during hatching/jumping/walking
  if (showChick) {
    let frameName: string;

    // Use walking animation during walking state
    if (isWalking) {
      frameName = `chick-forward-${chickFrame}.png`;
    } else {
      // Use hatch frame for all other chick states
      frameName = 'chick-hatch.png';
    }

    const chickFrameData = chickSpriteData.frames[frameName]?.frame;
    if (!chickFrameData) return null;

    return (
      <Image
        ref={eggRef}
        image={chickImage}
        x={position.x}
        y={position.y}
        width={CHICK_SIZE.width}
        height={CHICK_SIZE.height}
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

export default EggEnhancedHatch;
