import { Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';

import { AppActorContext } from '../app.machine';
import { getBorderRadius } from '../gameConfig';

export function IntroImage() {
  const snapshot = AppActorContext.useSelector((state) => state);
  const { gameConfig } = snapshot.context;
  const showGameIntro = snapshot.matches('Intro');

  const [titleImage] = useImage('images/eggdrop-title.png');
  const borderRadius = getBorderRadius();

  if (!showGameIntro) {
    return null;
  }
  return (
    <Group
      x={0.5 * gameConfig.stage.width - 500}
      y={0.5 * gameConfig.stage.height - 250}
      listening={false}
    >
      {/* Border stroke */}
      <Rect
        width={1000}
        height={500}
        cornerRadius={borderRadius}
        stroke={gameConfig.colors.primaryYellow}
        strokeWidth={10}
      />
      {/* Transparent background overlay */}
      <Rect
        width={980}
        height={480}
        x={10}
        y={10}
        fill="#222d57"
        opacity={0.5}
        cornerRadius={borderRadius}
      />
      {/* Main title image */}
      <Image image={titleImage} width={900} height={405} x={50} y={47} />
    </Group>
  );
}
