import { useRef, useEffect } from 'react';

import Konva from 'konva';
import { Image, Group, Rect } from 'react-konva';
import useImage from 'use-image';

import { isImageRef } from '../types';

import type { SpriteData } from '../types/assets';

export function MaskImage({
  maskImageFrame,
  maskImageURL,
}: {
  maskImageFrame: SpriteData['frames'][string]['frame'];
  maskImageURL: string;
}) {
  const [maskImage] = useImage(maskImageURL);
  const rectRef = useRef<Konva.Rect>(null);
  const maskRef = useRef<Konva.Image>(null);

  useEffect(() => {
    if (maskImage && isImageRef(rectRef) && isImageRef(maskRef)) {
      const maskNode = maskRef.current;
      const rectNode = rectRef.current;
      const layer = rectNode.getLayer();

      // Set the crop for the mask image
      maskNode.crop({
        x: maskImageFrame.x,
        y: maskImageFrame.y,
        width: maskImageFrame.w,
        height: maskImageFrame.h,
      });

      // Apply the mask to the rect
      rectNode.cache();
      rectNode.filters([Konva.Filters.Mask]);
      rectNode.setAttr('mask', maskNode);

      layer?.batchDraw();
    }
  }, [maskImage, maskImageFrame, maskRef, rectRef]);

  return (
    <Group>
      <Rect
        ref={rectRef}
        x={5}
        y={5}
        width={40}
        height={40}
        cornerRadius={4}
        fill="white"
        opacity={0.7}
      />
      {/* Image with the alpha mask applied */}
      {maskImage && (
        <Image ref={maskRef} x={12} y={12} image={maskImage} visible={true} />
      )}
    </Group>
  );
}

export function MaskedRect({ maskImageURL }: { maskImageURL: string }) {
  const [maskImage] = useImage(maskImageURL);
  const groupRef = useRef<Konva.Group>(null);

  useEffect(() => {
    if (groupRef.current && maskImage) {
      const group = groupRef.current;
      group.clipFunc((ctx) => {
        ctx.drawImage(maskImage, 0, 0, maskImage.width, maskImage.height);
      });
    }
  }, [maskImage, groupRef]);

  return (
    <Group ref={groupRef}>
      <Rect
        x={5}
        y={5}
        width={40}
        height={40}
        cornerRadius={4}
        fill="white"
        opacity={0.7}
      />
      <Image
        image={maskImage}
        x={50}
        y={50}
        width={200}
        height={200}
        visible={false} // Hide the image as it's only used for clipping
      />
    </Group>
  );
}
