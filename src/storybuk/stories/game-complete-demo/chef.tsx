import { useEffect, useRef, useState, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Ellipse, Group, Image } from 'react-konva';
import useImage from 'use-image';

import chefSpriteData from '../../../images/chef.sprite.json';
import { CHEF_POT_OFFSET } from '../../story-config-constants';

import { chefMachine } from './chef.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Chef Component - Autonomous Movement with Catch Support
 *
 * Combines autonomous back-and-forth movement with catch reaction and pot rim hit box.
 */

type ChefFrameName = 'chef-catching.png' | 'chef-leg-1.png' | 'chef-leg-2.png';

const CHEF_SIZE = {
  width: 344,
  height: 344,
};

export function Chef({
  actorRef,
  onPotRimHitRefReady,
  hitAreaFill = 'transparent',
}: {
  actorRef: ActorRefFrom<typeof chefMachine>;
  onPotRimHitRefReady?: (ref: RefObject<Konva.Ellipse | null>) => void;
  hitAreaFill?: string;
}) {
  const {
    position,
    isMoving,
    movingDirection,
    absoluteTweenSpeed,
    isCatching,
  } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    isMoving: state?.value === 'Moving',
    movingDirection: state?.context.movingDirection ?? 'none',
    absoluteTweenSpeed: Math.abs(state?.context.currentTweenSpeed ?? 0),
    isCatching: state?.context.isCatching ?? false,
  }));

  const [image] = useImage('/images/chef.sprite.png');

  const chefRef = useRef<Konva.Group>(null);
  useEffect(() => {
    if (chefRef.current) {
      actorRef.send({ type: 'Set chefRef', chefRef: chefRef as any });
    }
  }, [actorRef, chefRef]);

  const chefPotRimHitRef = useRef<Konva.Ellipse>(null);
  const potRimHitRefSent = useRef(false);
  useEffect(() => {
    if (
      onPotRimHitRefReady &&
      chefPotRimHitRef.current &&
      !potRimHitRefSent.current
    ) {
      onPotRimHitRefReady(chefPotRimHitRef);
      actorRef.send({
        type: 'Set chefPotRimHitRef',
        chefPotRimHitRef,
      });
      potRimHitRefSent.current = true;
    }
  }, [onPotRimHitRefReady, actorRef]);

  const [frameName, setFrameName] =
    useState<ChefFrameName>('chef-catching.png');

  useEffect(() => {
    let interval: ReturnType<typeof setInterval> | null = null;

    // Show catching animation when catching
    if (isCatching) {
      setFrameName('chef-catching.png');
    } else if (isMoving && movingDirection !== 'none') {
      // Walking animation for autonomous movement
      const walkFrameNames: ChefFrameName[] = [
        'chef-leg-1.png',
        'chef-leg-2.png',
      ];

      // Set first frame immediately
      setFrameName(walkFrameNames[0]!);

      // Calculate interval based on tween speed
      const [animationIntervalMinMS, animationIntervalMaxMS] = [120, 300];
      const intervalMS = Math.max(
        animationIntervalMinMS,
        animationIntervalMaxMS - absoluteTweenSpeed * 50
      );

      interval = setInterval(() => {
        setFrameName((prevFrameName) => {
          const index = walkFrameNames.indexOf(prevFrameName);
          if (index === -1 || index === walkFrameNames.length - 1) {
            return walkFrameNames[0]!;
          }
          return walkFrameNames[index + 1]!;
        });
      }, intervalMS);
    } else {
      // Idle
      setFrameName('chef-leg-1.png');
    }

    return () => {
      if (interval) {
        clearInterval(interval);
      }
    };
  }, [isMoving, movingDirection, absoluteTweenSpeed, isCatching]);

  if (!position) {
    return null;
  }

  const currentFrame = chefSpriteData.frames[frameName]?.frame;
  if (!currentFrame) {
    return null;
  }

  // Determine facing direction based on movement direction
  // Default to facing right when idle or moving right
  const shouldFaceRight =
    movingDirection === 'right' || movingDirection === 'none';
  const scaleX = shouldFaceRight ? -1 : 1;

  return (
    <Group ref={chefRef} x={position.x} y={position.y}>
      <Image
        image={image}
        offsetX={CHEF_SIZE.width / 2}
        width={CHEF_SIZE.width}
        height={CHEF_SIZE.height}
        scaleX={scaleX}
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
        radiusX={CHEF_POT_OFFSET.catchRadius}
        radiusY={CHEF_POT_OFFSET.rimHeight / 2}
        offsetX={
          shouldFaceRight ? -CHEF_POT_OFFSET.offsetX : CHEF_POT_OFFSET.offsetX
        }
        offsetY={CHEF_POT_OFFSET.offsetY}
        width={CHEF_POT_OFFSET.rimWidth}
        height={CHEF_POT_OFFSET.rimHeight}
        fill={hitAreaFill}
      />
    </Group>
  );
}
