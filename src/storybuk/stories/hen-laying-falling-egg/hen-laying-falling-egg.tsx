import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';
import henSpriteData from '../../../images/hen.sprite.json';

import type { eggMachine } from './egg.machine';
import type { henLayingFallingEggMachine } from './hen-laying-falling-egg.machine';
import type { henMachine } from './hen.machine';
import type { ActorRefFrom } from 'xstate';

/**
 * Hen Laying Falling Egg Component
 *
 * Renders the orchestrator's child actors (stationary hen and falling eggs).
 * Demonstrates multi-actor pattern with:
 * - One hen actor that cycles through laying states
 * - Multiple egg actors that fall with gravity and rotation
 *
 * The orchestrator spawns actors and manages their lifecycle.
 */

const HEN_SIZE = { width: 120, height: 120 };
const EGG_SIZE = { width: 30, height: 30 };

type HenFrameName = keyof typeof henSpriteData.frames;

// Laying poses cycle through different frames each time
const LAYING_POSES: HenFrameName[] = [
  'back-left.png',
  'back-right.png',
  'jump-2.png',
];

// Sub-component for rendering the hen
function HenSprite({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henMachine>;
}) {
  const { position, isLaying } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    isLaying: state?.hasTag('laying') ?? false,
  }));

  const [henImage] = useImage('/images/hen.sprite.png');
  const henRef = useRef<Konva.Image>(null);
  const [frameName, setFrameName] = useState<HenFrameName>('forward.png');
  const layingFrameIndexRef = useRef(0);

  useEffect(() => {
    if (henRef.current) {
      actorRef.send({
        type: 'Set henRef',
        henRef: henRef as React.RefObject<Konva.Image>,
      });
    }
  }, [actorRef]);

  useEffect(() => {
    if (isLaying) {
      // Cycle through laying poses
      const pose = LAYING_POSES[layingFrameIndexRef.current];
      if (pose) {
        setFrameName(pose);
        layingFrameIndexRef.current =
          (layingFrameIndexRef.current + 1) % LAYING_POSES.length;
      }
    } else {
      setFrameName('forward.png');
    }
  }, [isLaying]);

  const frameData = henSpriteData.frames[frameName]?.frame;
  if (!frameData) return null;

  return (
    <Image
      ref={henRef}
      image={henImage}
      x={position.x}
      y={position.y}
      width={HEN_SIZE.width}
      height={HEN_SIZE.height}
      crop={{
        x: frameData.x,
        y: frameData.y,
        width: frameData.w,
        height: frameData.h,
      }}
    />
  );
}

// Sub-component for rendering a falling egg
function EggSprite({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggMachine>;
}) {
  const { position, rotation, isDone } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    rotation: state?.context.rotation ?? 0,
    isDone: state?.matches('Done') ?? false,
  }));

  const [eggImage] = useImage('/images/egg.sprite.png');
  const eggRef = useRef<Konva.Image>(null);
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (eggRef.current) {
      actorRef.send({
        type: 'Set eggRef',
        eggRef: eggRef as React.RefObject<Konva.Image>,
      });
    }
  }, [actorRef]);

  // Animation loop for falling
  useEffect(() => {
    if (isDone) return;

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
  }, [actorRef, isDone]);

  if (isDone) return null;

  // Use gold egg for this demo
  const frameName = 'egg-gold.png';
  const frameData =
    eggSpriteData.frames[frameName as keyof typeof eggSpriteData.frames]?.frame;
  if (!frameData) return null;

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
        x: frameData.x,
        y: frameData.y,
        width: frameData.w,
        height: frameData.h,
      }}
    />
  );
}

// Main component that renders the orchestrator's children
export function HenLayingFallingEgg({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henLayingFallingEggMachine>;
}) {
  const { henActorRef, eggActorRefs } = useSelector(actorRef, (state) => ({
    henActorRef: state?.context.henActorRef ?? null,
    eggActorRefs: state?.context.eggActorRefs ?? [],
  }));

  // Track eggs with stable keys
  const [eggKeys] = useState(() => new Map<string, string>());

  return (
    <>
      {/* Render hen */}
      {henActorRef && <HenSprite actorRef={henActorRef} />}

      {/* Render all spawned eggs */}
      {eggActorRefs.map((eggRef) => {
        const eggId = eggRef.getSnapshot().context.id;
        // Ensure stable key for each egg
        if (!eggKeys.has(eggId)) {
          eggKeys.set(eggId, eggId);
        }
        return <EggSprite key={eggKeys.get(eggId)} actorRef={eggRef} />;
      })}
    </>
  );
}
