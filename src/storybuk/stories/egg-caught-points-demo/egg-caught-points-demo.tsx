import { useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Image } from 'react-konva';
import useImage from 'use-image';

import uiSpriteData from '../../../../public/images/ui.sprite.json';
import { eggCaughtPointsMachine } from '../../../EggCaughtPoints/eggCaughtPoints.machine';
import { isImageRef } from '../../../types';

import type { EggColor } from '../../../Egg/egg.machine';
import type { ActorRefFrom } from 'xstate';

/**
 * Egg Caught Points Story Component
 *
 * Displays animated points text that fades upward when an egg is caught.
 * Alternates between +1 and +10 graphics every 2 seconds for story purposes.
 */

export function EggCaughtPointsDemo({
  actorRef,
}: {
  actorRef: ActorRefFrom<typeof eggCaughtPointsMachine>;
}) {
  const { position, isAnimating } = useSelector(actorRef, (state) => ({
    position: state?.context.position ?? { x: 0, y: 0 },
    isAnimating: state?.matches('Animating') ?? false,
  }));

  const [uiImage] = useImage('/images/ui.sprite.png');
  const [currentEggColor, setCurrentEggColor] = useState<EggColor>('white');

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

  // Reset to white when not animating
  useEffect(() => {
    if (!isAnimating) {
      setCurrentEggColor('white');
    }
  }, [isAnimating]);

  // Loop the animation every 2 seconds when animating, alternating between white and gold
  useEffect(() => {
    if (
      !isAnimating ||
      !isImageRef(eggCaughtPointsRef) ||
      !eggCaughtPointsRef.current
    ) {
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

    // Loop animation every 2 seconds
    const animationInterval = setInterval(animatePoints, 2000);

    let colorSwitchInterval: ReturnType<typeof setInterval> | null = null;

    // Alternate color after first animation completes (1.5s), then start interval for every 2s
    const colorSwitchTimeout = setTimeout(() => {
      setCurrentEggColor((prev) => (prev === 'white' ? 'gold' : 'white'));

      // Now start the interval for subsequent color switches
      colorSwitchInterval = setInterval(() => {
        setCurrentEggColor((prev) => (prev === 'white' ? 'gold' : 'white'));
      }, 2000);
    }, 1500);

    return () => {
      clearInterval(animationInterval);
      clearTimeout(colorSwitchTimeout);
      if (colorSwitchInterval) {
        clearInterval(colorSwitchInterval);
      }
    };
  }, [position, eggCaughtPointsRef, isAnimating]);

  const imageKey = currentEggColor === 'gold' ? '10-points.png' : '1-point.png';
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
