import { Group, Image, Layer, Rect } from 'react-konva';
import useImage from 'use-image';

import { AppActorContext } from '../app.machine';
import { IntroImage } from '../IntroImage/IntroImage';

export function BackgroundLayer() {
  const { gameConfig } = AppActorContext.useSelector((state) => ({
    gameConfig: state.context.gameConfig,
  }));

  const [kitchenBgImage] = useImage('images/kitchen-bg-4.png');
  const [henBeamImage] = useImage('images/hen-beam-gray.png');

  return (
    <Layer listening={false}>
      {/* Background kitchen image */}
      <Group>
        <Image
          image={kitchenBgImage}
          width={gameConfig.stage.width}
          height={gameConfig.stage.height}
          cornerRadius={10}
        />
        {/* Translucent overlay to mute the background image */}
        <Rect
          width={gameConfig.stage.width}
          height={gameConfig.stage.height}
          opacity={0.5}
          fill="black"
          y={0}
          cornerRadius={10}
        />
        {/* Hen beam image */}
        <Image
          image={henBeamImage}
          width={gameConfig.henBeam.width}
          height={gameConfig.henBeam.height}
          x={gameConfig.henBeam.x}
          y={gameConfig.henBeam.y}
        />
      </Group>
      <IntroImage />
    </Layer>
  );
}
