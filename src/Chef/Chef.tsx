import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Group, Image, Ellipse } from 'react-konva';
import useImage from 'use-image';

import { AppActorContext } from '../app.machine';
import { CHEF_ACTOR_ID, GAME_LEVEL_ACTOR_ID } from '../constants';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';
import { isImageRef } from '../types';

import { chefMachine } from './chef.machine';

import type { SpriteData } from '../types/assets';
import type { ActorRefFrom } from 'xstate';

type ChefFrameName = 'chef-catching.png' | 'chef-leg-1.png' | 'chef-leg-2.png';
type ChefFrames = Record<ChefFrameName, SpriteData['frames'][string]>;

export function Chef() {
  const [image] = useImage('images/chef.sprite.png');
  const appActorRef = AppActorContext.useActorRef();
  const gameLevelActorRef = appActorRef.system.get(
    GAME_LEVEL_ACTOR_ID
  ) as ActorRefFrom<typeof gameLevelMachine>;
  const chefActorRef = appActorRef.system.get(CHEF_ACTOR_ID) as ActorRefFrom<
    typeof chefMachine
  >;
  const { movingDirection, lastMovingDirection } = useSelector(
    chefActorRef,
    (state) => ({
      movingDirection: state?.context.movingDirection ?? 'none',
      lastMovingDirection: state?.context.lastMovingDirection ?? 'none',
    })
  );
  const { chefPotRimConfig } = AppActorContext.useSelector((state) => ({
    chefPotRimConfig: state.context.gameConfig.chef.potRim,
  }));

  const {
    chefConfig,
    chefFrames,
    chefFrameNames,
    position,
    isAnimateAsMoving,
    isCatchingEgg,
  } = useSelector(chefActorRef, (state) => ({
    chefConfig: state?.context.chefConfig ?? {
      width: 0,
      height: 0,
      x: 0,
      y: 0,
    },
    chefFrames: (state?.context.chefAssets?.frames ?? {}) as ChefFrames,
    chefFrameNames: (Object.keys(
      state?.context.chefAssets?.frames ?? {}
    ) ?? []) as ChefFrameName[],
    position: state?.context.position ?? { x: 0, y: 0 },
    // Use direction here instead of speed so that the chef's leg movement
    // stops as soon as the user releases the arrow key
    isAnimateAsMoving: (state?.context.direction ?? 0) !== 0,
    isCatchingEgg: state?.context.isCatchingEgg ?? false,
  }));

  const [frameIndex, setFrameIndex] = useState(1);

  // Set the chefRef in the chef machine
  const chefRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (chefActorRef && isImageRef(chefRef)) {
      chefActorRef.send({ type: 'Set chefRef', chefRef });
    }
  }, [chefActorRef, chefRef]);

  // Set the chefPotRimHitRef in the gameLevel machine
  const chefPotRimHitRef = useRef<Konva.Ellipse>(null);
  useEffect(() => {
    if (isImageRef(chefPotRimHitRef)) {
      gameLevelActorRef.send({
        type: 'Set chefPotRimHitRef',
        chefPotRimHitRef,
      });
    }
  }, [gameLevelActorRef, chefPotRimHitRef]);

  // Animate the chef's leg movement when the chef is moving
  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    if (isAnimateAsMoving && !isCatchingEgg) {
      // Change frameIndex immediately so if the chef only moves
      // a tiny bit so we still see leg movement
      setFrameIndex((prevIndex) => (prevIndex === 1 ? 2 : 1));

      interval = setInterval(() => {
        setFrameIndex((prevIndex) => (prevIndex === 1 ? 2 : 1));
      }, 150);
    } else {
      setFrameIndex(1);
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isAnimateAsMoving, isCatchingEgg]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft') {
        chefActorRef?.send({ type: 'Set direction', direction: -1 });
      } else if (e.key === 'ArrowRight') {
        chefActorRef?.send({ type: 'Set direction', direction: 1 });
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
        chefActorRef?.send({ type: 'Set direction', direction: 0 });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    window.addEventListener('keyup', handleKeyUp);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
      window.removeEventListener('keyup', handleKeyUp);
    };
  }, [chefActorRef]);

  // Override frameIndex to 0 if isCatchingEgg is true
  const frameName = isCatchingEgg
    ? 'chef-catching.png'
    : (chefFrameNames[frameIndex] as ChefFrameName);
  const currentFrame = chefFrames[frameName]?.frame;
  if (!currentFrame) {
    return null;
  }

  // Calculate the chef's direction based on movingDirection and lastMovingDirection
  const shouldFaceRight =
    movingDirection === 'right' || lastMovingDirection === 'right';

  return (
    <Group x={position.x} y={position.y}>
      <Image
        ref={chefRef}
        image={image}
        offsetX={chefConfig.width / 2}
        width={chefConfig.width}
        height={chefConfig.height}
        scaleX={shouldFaceRight ? -1 : 1}
        crop={{
          x: currentFrame.x,
          y: currentFrame.y,
          width: currentFrame.w,
          height: currentFrame.h,
        }}
      />
      {/* Chef pot rim hit box (for catching eggs) */}
      <Ellipse
        ref={chefPotRimHitRef}
        radiusX={chefPotRimConfig.radiusX}
        radiusY={chefPotRimConfig.radiusY}
        offsetX={
          shouldFaceRight ? -chefPotRimConfig.offsetX : chefPotRimConfig.offsetX
        }
        offsetY={chefPotRimConfig.offsetY}
        width={chefPotRimConfig.width}
        height={chefPotRimConfig.height}
        fill="transparent"
      />
    </Group>
  );
}
