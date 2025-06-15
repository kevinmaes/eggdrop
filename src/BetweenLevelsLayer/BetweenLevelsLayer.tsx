import { useSelector } from '@xstate/react';
import { Layer } from 'react-konva';

import { AppActorContext } from '../app.machine';
import { GameScoreBox } from '../GameScoreBox/GameScoreBox';

export function BetweenLevelsLayer() {
  const appActorRef = AppActorContext.useActorRef();
  const { gameConfig, isBetweenLevels } = useSelector(appActorRef, state => ({
    gameConfig: state.context.gameConfig,
    isBetweenLevels: state.hasTag('between levels'),
  }));

  if (!isBetweenLevels) {
    return null;
  }
  const gameScoreBoxWidth = 300;
  const gameScoreBoxHeight = 380;
  const xPos = gameConfig.stage.midX - 0.5 * gameScoreBoxWidth;
  const yPos = gameConfig.stage.midY - 0.5 * gameScoreBoxHeight;

  return (
    <Layer>
      <GameScoreBox
        x={xPos}
        y={yPos}
        width={gameScoreBoxWidth}
        height={gameScoreBoxHeight}
      />
    </Layer>
  );
}
