import { Group, Image, Rect } from 'react-konva';
import useImage from 'use-image';

import { AppActorContext } from '../app.machine';

export function IntroImage() {
  const { gameConfig, showGameIntro } = AppActorContext.useSelector(state => ({
    gameConfig: state.context.gameConfig,
    showGameIntro: state.matches('Intro'),
  }));

  const [titleImage] = useImage('images/egg-drop-title.png');

  if (!showGameIntro) {
    return null;
  }
  return (
    <Group
      x={0.5 * gameConfig.stageDimensions.width - 500}
      y={0.5 * gameConfig.stageDimensions.height - 250}
    >
      {/* Border stroke */}
      <Rect
        width={1000}
        height={500}
        cornerRadius={20}
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
        cornerRadius={20}
      />
      {/* Main title image */}
      <Image image={titleImage} width={900} height={405} x={50} y={47} />
    </Group>
  );
}
