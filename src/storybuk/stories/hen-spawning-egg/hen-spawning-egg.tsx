import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import eggSpriteData from '../../../images/egg.sprite.json';
import henSpriteData from '../../../images/hen.sprite.json';

import type { eggMachine } from './egg.machine';
import type { henMachine } from './hen.machine';
import type { storyMachine } from './story.machine';
import type { ActorRefFrom } from 'xstate';

/**
 * Hen Spawning Egg Component
 *
 * Renders the orchestrator's child actors (hen and eggs).
 * Demonstrates how a parent component can render dynamically spawned actors.
 *
 * The orchestrator machine spawns:
 * - One hen actor that moves and lays eggs
 * - Multiple egg actors that fall and land
 *
 * This component subscribes to the orchestrator and renders all children.
 */

const HEN_SIZE = { width: 120, height: 120 };
const EGG_SIZE = { width: 30, height: 30 };

type HenFrameName = keyof typeof henSpriteData.frames;

// Laying poses cycle through different frames each time
// Only use back-facing and jump poses (not angle poses which face partly forward)
const LAYING_POSES_LEFT: HenFrameName[] = ['back-left.png', 'jump-1.png'];
const LAYING_POSES_RIGHT: HenFrameName[] = ['back-right.png', 'jump-2.png'];

// Sub-component for rendering the hen
function HenSprite({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henMachine>;
}) {
  const { position, isMoving, isLaying, direction, eggsLaid } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      isMoving: state?.matches('Moving') ?? false,
      isLaying: state?.hasTag('laying') ?? false,
      direction: state?.context.direction ?? 1,
      eggsLaid: state?.context.eggsLaid ?? 0,
    })
  );

  const [henImage] = useImage('/images/hen.sprite.png');
  const henRef = useRef<Konva.Image>(null);
  const [frameName, setFrameName] = useState<HenFrameName>('forward.png');

  useEffect(() => {
    if (henRef.current) {
      actorRef.send({
        type: 'Set henRef',
        henRef: henRef as React.RefObject<Konva.Image>,
      });
    }
  }, [actorRef]);

  // Walking and laying animation cycle
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isLaying) {
      // Cycle through different laying poses based on eggs laid count
      const layingPoses =
        direction === 1 ? LAYING_POSES_RIGHT : LAYING_POSES_LEFT;
      const poseIndex = eggsLaid % layingPoses.length;
      const pose = layingPoses[poseIndex];
      if (pose) {
        setFrameName(pose);
      }
    } else if (isMoving) {
      // Walking animation
      const walkDirection = direction === 1 ? 'right' : 'left';
      const walkFrameNames: HenFrameName[] = [
        `walk-${walkDirection}-1.png`,
        `walk-${walkDirection}-2.png`,
        `walk-${walkDirection}-3.png`,
        `walk-${walkDirection}-4.png`,
      ];

      // Set first frame immediately
      const firstFrame = walkFrameNames[0];
      if (firstFrame) {
        setFrameName(firstFrame);
      }

      // Cycle through walk frames
      interval = setInterval(() => {
        setFrameName((prevFrameName) => {
          const index = walkFrameNames.indexOf(prevFrameName);
          if (index === -1 || index === walkFrameNames.length - 1) {
            return walkFrameNames[0] ?? 'forward.png';
          }
          return walkFrameNames[index + 1] ?? 'forward.png';
        });
      }, 100); // Animation speed
    } else {
      setFrameName('forward.png');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMoving, isLaying, direction, eggsLaid]);

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

// Sub-component for rendering an egg
function EggSprite({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggMachine>;
}) {
  const { position, color, isDone } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    color: state?.context.color ?? 'white',
    isDone: state?.matches('Done') ?? false,
  }));

  const [eggImage] = useImage('/images/egg.sprite.png');
  const eggRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (eggRef.current) {
      actorRef.send({
        type: 'Set eggRef',
        eggRef: eggRef as React.RefObject<Konva.Image>,
      });
    }
  }, [actorRef]);

  if (isDone) return null;

  const frameName = `egg-${color}.png`;
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
export function HenSpawningEgg({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof storyMachine>;
}) {
  const { henActorRef, eggActorRefs, isRunning } = useSelector(
    actorRef,
    (state) => ({
      henActorRef: state?.context.henActorRef ?? null,
      eggActorRefs: state?.context.eggActorRefs ?? [],
      isRunning: state?.matches('Running') ?? false,
    })
  );

  // Track eggs with stable keys
  const [eggKeys] = useState(() => new Map<string, string>());

  // Animation loop for hen movement
  const animationFrameRef = useRef<number>(0);
  const lastUpdateRef = useRef<number>(0);

  useEffect(() => {
    if (!isRunning || !henActorRef) return;

    const targetFPS = 60;
    const frameTime = 1000 / targetFPS;

    const animate = (timestamp: number) => {
      const elapsed = timestamp - lastUpdateRef.current;

      if (elapsed >= frameTime) {
        henActorRef.send({ type: 'Update' });
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
  }, [henActorRef, isRunning]);

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
