import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Group, Image } from 'react-konva';
import useImage from 'use-image';

import henSpriteData from '../../../images/hen.sprite.json';

import { henMachine } from './hen.machine';

import type { ActorRefFrom } from 'xstate';

/**
 * Moving Hen Component - Continuous Laying While Moving
 *
 * Displays a hen that moves back and forth across the top of the screen
 * while continuously laying eggs. Shows idle sprite when waiting, and
 * laying sprites when laying.
 */

type HenFrameName =
  | 'forward.png'
  | 'back-left.png'
  | 'back-right.png'
  | 'jump-2.png';

const HEN_SIZE = {
  width: 120,
  height: 120,
};

export function Hen({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof henMachine>;
}) {
  const { position, isLaying, movingDirection } = useSelector(
    actorRef,
    (state) => ({
      position: state?.context.position ?? { x: 0, y: 0 },
      isLaying: state?.hasTag('laying') ?? false,
      movingDirection: state?.context.movingDirection ?? 'none',
    })
  );

  const [image] = useImage('/images/hen.sprite.png');

  const henRef = useRef<Konva.Group>(null);
  useEffect(() => {
    if (henRef.current) {
      actorRef.send({ type: 'Set henRef', henRef });
    }
  }, [actorRef]);

  const [frameName, setFrameName] = useState<HenFrameName>('forward.png');
  const layingFrameIndexRef = useRef(0);

  useEffect(() => {
    if (isLaying) {
      // Cycle through laying frames
      const layingFrames: HenFrameName[] = [
        'back-left.png',
        'back-right.png',
        'jump-2.png',
      ];
      setFrameName(layingFrames[layingFrameIndexRef.current] as HenFrameName);
      layingFrameIndexRef.current =
        (layingFrameIndexRef.current + 1) % layingFrames.length;
    } else {
      setFrameName('forward.png');
    }
  }, [isLaying]);

  if (!position) {
    return null;
  }

  const currentFrame = henSpriteData.frames[frameName]?.frame;
  if (!currentFrame) {
    return null;
  }

  // Flip hen sprite based on movement direction
  const shouldFaceRight =
    movingDirection === 'right' || movingDirection === 'none';
  const scaleX = shouldFaceRight ? 1 : -1;

  return (
    <Group ref={henRef} x={position.x} y={position.y}>
      <Image
        image={image}
        width={HEN_SIZE.width}
        height={HEN_SIZE.height}
        scaleX={scaleX}
        offsetX={shouldFaceRight ? 0 : HEN_SIZE.width}
        crop={{
          x: currentFrame.x,
          y: currentFrame.y,
          width: currentFrame.w,
          height: currentFrame.h,
        }}
      />
    </Group>
  );
}
