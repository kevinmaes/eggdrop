import { useEffect, useRef, type RefObject } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Ellipse, Group, Image } from 'react-konva';
import useImage from 'use-image';

import chefSpriteData from '../../../images/chef.sprite.json';
import { CHEF_POT_OFFSET } from '../../story-config-constants';

import { chefMachine } from './chef.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Stationary Chef Component - With Catch Reaction
 *
 * Displays a stationary chef that reacts when catching eggs.
 * Shows idle sprite normally, catching sprite briefly on catch.
 */

function isImageRef(imageRef: unknown): imageRef is RefObject<Konva.Image> {
  if (imageRef) {
    return true;
  }
  return false;
}

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
  onPotRimHitRefReady?: (ref: RefObject<Konva.Ellipse>) => void;
  hitAreaFill?: string;
}) {
  const { position, isCatching } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    isCatching: state?.context.isCatching ?? false,
  }));

  const [image] = useImage('/images/chef.sprite.png');

  const chefRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (isImageRef(chefRef)) {
      actorRef.send({ type: 'Set chefRef', chefRef });
    }
  }, [actorRef, chefRef]);

  const chefPotRimHitRef = useRef<Konva.Ellipse>(null);
  const potRimHitRefSent = useRef(false);
  useEffect(() => {
    if (
      onPotRimHitRefReady &&
      isImageRef(chefPotRimHitRef) &&
      !potRimHitRefSent.current
    ) {
      onPotRimHitRefReady(chefPotRimHitRef);
      potRimHitRefSent.current = true;
    }
  }, [onPotRimHitRefReady]);

  if (!position) {
    return null;
  }

  // Use catching sprite when catching, otherwise use leg-1 idle sprite
  const frameName = isCatching ? 'chef-catching.png' : 'chef-leg-1.png';
  const currentFrame = chefSpriteData.frames[frameName]?.frame;
  if (!currentFrame) {
    return null;
  }

  // Match the facing direction of other chef stories
  const scaleX = -1;
  const shouldFaceRight = scaleX === -1;

  return (
    <Group x={position.x} y={position.y}>
      <Image
        ref={chefRef}
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
