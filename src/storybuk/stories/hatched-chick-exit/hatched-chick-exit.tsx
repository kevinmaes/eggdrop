import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import chickSpriteData from '../../../../public/images/chick.sprite.json';

import hatchedChickExitMachine from './hatched-chick-exit.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Hatched Chick Exit Component
 *
 * Shows chick transitioning from hatched to exiting:
 * - Waiting: chick-hatch (in shell)
 * - Hatched: chick-forward-1 (standing, brief pause)
 * - Exiting: chick-run frames (animated running off screen)
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

function HatchedChickExit({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof hatchedChickExitMachine>;
}) {
  const { position, currentState, chickExitDirection } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      currentState: state?.value ?? 'Waiting',
      chickExitDirection: state?.context.chickExitDirection ?? 1,
    })
  );

  const isHatched = currentState === 'Hatched';
  const isExiting = currentState === 'Exiting';

  const [chickImage] = useImage('/images/chick.sprite.png');
  const chickRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);
  const hasStartedRef = useRef(false);

  // Animation frame for running chick
  const [chickRunFrame, setChickRunFrame] = useState(1);
  const chickAnimationFrameRef = useRef<number>(0);

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
    if (!isExiting) {
      return;
    }

    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= frameTime) {
        actorRef.send({ type: 'Update' });
        lastUpdateRef.current = timestamp;

        // Animate running frames
        chickAnimationFrameRef.current += 1;
        if (chickAnimationFrameRef.current >= 10) {
          setChickRunFrame((prev) => (prev === 1 ? 2 : 1));
          chickAnimationFrameRef.current = 0;
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
  }, [actorRef, isExiting]);

  if (!position) {
    return null;
  }

  let frameName = 'chick-hatch.png'; // Default (waiting)

  if (isHatched) {
    frameName = 'chick-forward-1.png'; // Standing
  } else if (isExiting) {
    const direction = chickExitDirection === 1 ? 'right' : 'left';
    frameName = `chick-run-${direction}-${chickRunFrame}.png`;
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

export default HatchedChickExit;
