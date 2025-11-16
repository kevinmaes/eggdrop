import { useEffect, useRef } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import uiSpriteData from '../../../../public/images/ui.sprite.json';
import { eggCaughtPointsMachine } from '../../../EggCaughtPoints/eggCaughtPoints.machine';
import { isImageRef } from '../../../types';

import type { ActorRefFrom } from 'xstate';

/**
 * Egg Caught Points Story Component
 *
 * Displays animated points text that fades upward when an egg is caught.
 * Loops the animation every 2 seconds for story purposes.
 */

function EggCaughtPointsDemo({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggCaughtPointsMachine>;
}) {
  const { position, eggColor } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    eggColor: state?.context.eggColor ?? 'white',
  }));

  const [uiImage] = useImage('/images/ui.sprite.png');

  const eggCaughtPointsRef = useRef<Konva.Image>(null);

  // Send the ref to the actor once
  useEffect(() => {
    if (isImageRef(eggCaughtPointsRef)) {
      actorRef.send({
        type: 'Set eggCaughtPointsRef',
        eggCaughtPointsRef,
      });
    }
  }, [actorRef, eggCaughtPointsRef]);

  // Loop the animation every 2 seconds for story purposes
  useEffect(() => {
    if (!isImageRef(eggCaughtPointsRef) || !eggCaughtPointsRef.current) {
      return;
    }

    const animatePoints = () => {
      const node = eggCaughtPointsRef.current;
      if (!node) return;

      // Reset to initial state
      node.x(position.x);
      node.y(position.y);
      node.opacity(1);

      // Create and play tween
      const tween = new Konva.Tween({
        node: node,
        x: position.x,
        y: position.y - 120,
        opacity: 0,
        duration: 1.5,
        easing: Konva.Easings.EaseOut,
      });
      tween.play();
    };

    // Start first animation immediately
    animatePoints();

    // Loop every 2 seconds
    const interval = setInterval(animatePoints, 2000);

    return () => {
      clearInterval(interval);
    };
  }, [position, eggCaughtPointsRef]);

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
      y={position.y}
      offsetX={30} // Center the 60px wide image
      width={60}
      height={60}
      crop={{
        x: currentFrame.x,
        y: currentFrame.y,
        width: currentFrame.w,
        height: currentFrame.h,
      }}
    />
  );
}

export default EggCaughtPointsDemo;
