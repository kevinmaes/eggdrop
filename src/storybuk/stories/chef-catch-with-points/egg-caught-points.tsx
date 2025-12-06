import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import uiSpriteData from '../../../images/ui.sprite.json';
import { isImageRef } from '../../../types';

import type { EggColor } from '../../../Egg/egg.machine';
import type { eggCaughtPointsMachine } from '../../../EggCaughtPoints/eggCaughtPoints.machine';
import type { ActorRefFrom } from 'xstate';

/**
 * Story-specific EggCaughtPoints Component
 *
 * Simplified version for Storybuk that doesn't rely on game context.
 * Uses local sprite data instead of accessing gameAssets from app actor.
 */

export function EggCaughtPoints({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggCaughtPointsMachine>;
}) {
  const { position, eggColor } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    eggColor: (state?.context.eggColor ?? 'white') as EggColor,
  }));

  const eggCaughtPointsRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (!isImageRef(eggCaughtPointsRef)) {
      return;
    }
    actorRef.send({
      type: 'Set eggCaughtPointsRef',
      eggCaughtPointsRef,
    });
  }, [actorRef, eggCaughtPointsRef]);

  const [uiImage] = useImage('/images/ui.sprite.png');

  const imageKey = eggColor === 'gold' ? '10-points.png' : '1-point.png';
  const currentFrame = uiSpriteData.frames[imageKey]?.frame;

  if (!currentFrame) {
    return null;
  }
  return (
    <Image
      ref={eggCaughtPointsRef}
      image={uiImage}
      x={position.x}
      y={position.y - 50} // Start 20px higher than default offset
      offsetX={30} // Center the 60px wide image
      width={60}
      height={60}
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
      rotation={0}
    />
  );
}
