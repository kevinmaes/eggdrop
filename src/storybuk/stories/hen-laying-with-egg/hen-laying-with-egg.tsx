import { useEffect, useRef, useState, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';
import henSpriteData from '../../../images/hen.sprite.json';

import henLayingWithEggMachine from './hen-laying-with-egg.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Hen Laying With Egg Component
 *
 * Displays a hen that lays an actual egg which falls and spins.
 * Combines hen state transitions with egg animation.
 *
 * States:
 * - Idle: Shows forward.png (normal hen facing forward), no egg
 * - Laying: Cycles through laying frames (back-left, back-right, jump-1, jump-2)
 * - Egg falling: Hen returns to idle while egg drops and rotates
 *
 * Perfect for demonstrating:
 * - State-based object spawning
 * - Coordinated multi-element animation
 * - Physics simulation (falling + rotation)
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
  width: 240, // 2x scale
  height: 240, // 2x scale
};

const EGG_SIZE = {
  width: 60, // 2x scale
  height: 60, // 2x scale
};

function HenLayingWithEgg({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henLayingWithEggMachine>;
}) {
  const { position, isLaying, eggPosition, eggRotation, showEgg } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      isLaying: state?.hasTag('laying') ?? false,
      eggPosition: state?.context.eggPosition ?? null,
      eggRotation: state?.context.eggRotation ?? 0,
      showEgg: state?.context.showEgg ?? false,
    })
  );

  const [henImage] = useImage('/images/hen.sprite.png');
  const [eggImage] = useImage('/images/egg.sprite.png');

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

  const currentHenFrame = henSpriteData.frames[frameName]?.frame;
  if (!currentHenFrame) {
    return null;
  }

  // Always use gold egg for this demo
  const eggFrameName = 'egg-gold.png';
  const currentEggFrame = eggSpriteData.frames[eggFrameName]?.frame;

  return (
    <>
      {/* Hen */}
      <Image
        ref={henRef}
        image={henImage}
        x={position.x}
        y={position.y}
        width={HEN_SIZE.width}
        height={HEN_SIZE.height}
        crop={{
          x: currentHenFrame.x,
          y: currentHenFrame.y,
          width: currentHenFrame.w,
          height: currentHenFrame.h,
        }}
      />

      {/* Egg (only shown when spawned) */}
      {showEgg && eggPosition && currentEggFrame && (
        <Image
          image={eggImage}
          x={eggPosition.x}
          y={eggPosition.y}
          width={EGG_SIZE.width}
          height={EGG_SIZE.height}
          rotation={eggRotation}
          crop={{
            x: currentEggFrame.x,
            y: currentEggFrame.y,
            width: currentEggFrame.w,
            height: currentEggFrame.h,
          }}
        />
      )}
    </>
  );
}

export default HenLayingWithEgg;
