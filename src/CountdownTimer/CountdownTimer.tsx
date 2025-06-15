import { useSelector } from '@xstate/react';
import { Group, Rect, Text } from 'react-konva';

import { AppActorContext } from '../app.machine';
import { GAME_LEVEL_ACTOR_ID } from '../constants';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';

import type { ActorRefFrom } from 'xstate';

export function CountdownTimer({
  x,
  y,
  width,
  height,
}: {
  x: number;
  y: number;
  width: number;
  height: number;
}) {
  const appActorRef = AppActorContext.useActorRef();
  const gameLevelActorRef = appActorRef.system.get(
    GAME_LEVEL_ACTOR_ID
  ) as ActorRefFrom<typeof gameLevelMachine>;
  const { totalLevelMS, remainingMS, gameConfig } = useSelector(
    gameLevelActorRef,
    state => {
      if (!state) {
        return {
          gameConfig: null,
          totalLevelMS: 0,
          remainingMS: 0,
        };
      }
      return {
        gameConfig: state.context.gameConfig,
        totalLevelMS: state.context.gameConfig.levelDurationMS,
        remainingMS: state.context.remainingMS,
      };
    }
  );

  if (!gameConfig) {
    return null;
  }

  const minutes = Math.floor(remainingMS / 60000);
  const seconds = Math.floor((remainingMS % 60000) / 1000);

  const barInsetWidth = 5;
  const remainingPercentage = remainingMS / totalLevelMS;
  const totalBarWidth = width - 2 * barInsetWidth;
  const remainingTimeBarWidth = totalBarWidth * remainingPercentage;

  const remainingTimeString =
    minutes > 0
      ? `${minutes}m ${seconds.toString().padStart(2, '0')}s`
      : `${seconds.toString().padStart(2, '0')}s`;

  return (
    <Group x={x} y={y}>
      <Rect
        x={0}
        y={0}
        width={width}
        height={height}
        fill="transparent"
        stroke={gameConfig.colors.primaryOrange}
        strokeWidth={2}
        cornerRadius={8}
      />
      {/* Timer text */}
      <Text
        y={10}
        text={remainingTimeString}
        fontSize={20}
        fontStyle="bold"
        width={0.9 * width}
        align="right"
        // fill="white"
        fill={gameConfig.colors.primaryBlue}
        fontFamily="JetBrains Mono"
      />
      {/* Progress bar outline */}
      <Rect
        x={5}
        y={35}
        width={totalBarWidth}
        height={10}
        opacity={0.5}
        stroke={gameConfig.colors.primaryOrange}
        strokeWidth={1}
        cornerRadius={[0, 0, 5, 5]}
      />
      {/* Progress bar fill */}
      <Rect
        x={5}
        y={35}
        width={remainingTimeBarWidth}
        height={10}
        fill={gameConfig.colors.primaryBlue}
        opacity={0.5}
        stroke="white"
        strokeWidth={1}
        cornerRadius={[
          0,
          0,
          remainingTimeBarWidth > totalBarWidth - barInsetWidth ? 5 : 0,
          5,
        ]}
      />
    </Group>
  );
}
