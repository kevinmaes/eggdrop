import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import { AppActorContext } from '../app.machine';
import { isImageRef } from '../types';

import type { eggCaughtPointsMachine } from './eggCaughtPoints.machine';
import type { gameLevelMachine } from '../GameLevel/gameLevel.machine';
import type { ActorRefFrom } from 'xstate';

export function EggCaughtPoints({
  eggCaughtPointsActorRefs,
}: {
  eggCaughtPointsActorRefs: ActorRefFrom<typeof eggCaughtPointsMachine>;
}) {
  const appActorRef = AppActorContext.useActorRef();
  const { gameConfig } = AppActorContext.useSelector(state => {
    return {
      gameConfig: state.context.gameConfig,
    };
  });
  const gameLevelActorRef = appActorRef.system.get(
    'gameLevelMachine'
  ) as ActorRefFrom<typeof gameLevelMachine>;
  const { uiFrames } = useSelector(gameLevelActorRef, state => {
    return {
      uiFrames: state.context.gameAssets.ui.frames,
    };
  });

  const { position, eggColor } = useSelector(
    eggCaughtPointsActorRefs,
    state => {
      if (!state) {
        return { position: { x: 0, y: 0 } };
      }
      return {
        position: state.context.position,
        eggColor: state.context.eggColor,
      };
    }
  );

  const eggCaughtPointsRef = useRef<Konva.Image>(null);
  useEffect(() => {
    if (!isImageRef(eggCaughtPointsRef)) {
      return;
    }
    eggCaughtPointsActorRefs.send({
      type: 'Set eggCaughtPointsRef',
      eggCaughtPointsRef,
    });
  }, [eggCaughtPointsActorRefs, eggCaughtPointsRef]);

  const [uiImage] = useImage('images/ui.sprite.png');

  const imageKey = eggColor === 'gold' ? '10-points.png' : '1-point.png';
  const currentFrame = uiFrames[imageKey]?.frame;

  if (!currentFrame) {
    return null;
  }
  return (
    <Image
      ref={eggCaughtPointsRef}
      image={uiImage}
      x={position.x}
      y={position.y + gameConfig.eggCaughtPoints.yStartOffset}
      offsetX={0.5 * gameConfig.eggCaughtPoints.width}
      width={50}
      height={50}
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
