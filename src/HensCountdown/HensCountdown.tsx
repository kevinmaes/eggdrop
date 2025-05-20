import { useSelector } from '@xstate/react';
import { Group, Image, Rect, Text } from 'react-konva';
import type { ActorRefFrom } from 'xstate';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';
import { AppActorContext } from '../app.machine';
import useImage from 'use-image';

export function HensCountdown({
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
    'gameLevelMachine'
  ) as ActorRefFrom<typeof gameLevelMachine>;
  const { henFrames, gameConfig, totalHens, hensLeft } = useSelector(
    gameLevelActorRef,
    state => {
      if (!state) {
        return {};
      }
      return {
        gameConfig: state.context.gameConfig,
        henFrames: state.context.gameAssets.hen.frames,
        totalLevelMS: state.context.gameConfig.levelDurationMS,
        remainingMS: state.context.remainingMS,
        totalHens: state.context.gameConfig.populationSize,
        hensLeft: state.context.hensLeft,
      };
    }
  );
  const [image] = useImage('images/hen.sprite.png');

  if (!gameConfig) {
    return null;
  }

  const barInsetWidth = 5;
  const remainingPercentage = hensLeft / totalHens;
  const totalBarWidth = width - 2 * barInsetWidth;
  const remainingTimeBarWidth = totalBarWidth * remainingPercentage;
  const hensLeftString = `${hensLeft}`;
  const henSize = 50;
  const henFrame = henFrames['angle-right.png']?.frame;

  if (!henFrame) {
    return null;
  }

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
      {/* Hen image */}
      <Image
        image={image}
        x={2}
        y={-11}
        width={henSize}
        height={henSize}
        crop={{
          x: henFrame.x,
          y: henFrame.y,
          width: henFrame.w,
          height: henFrame.h,
        }}
      />
      {/* Timer text */}
      <Text
        y={10}
        text={hensLeftString}
        fontSize={20}
        fontStyle="bold"
        width={0.9 * width}
        align="right"
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
