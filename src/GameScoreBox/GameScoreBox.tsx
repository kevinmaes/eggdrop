import { Group, Rect, Text } from 'react-konva';

import { AppActorContext } from '../app.machine';
import { Button } from '../Button/Button';
import { EggTally } from '../EggTally/EggTally';

import type { LevelResults } from '../GameLevel/types';

export function GameScoreBox({
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
  const { gameConfig, gameScoreData, lastLevelResults } =
    AppActorContext.useSelector(state => ({
      gameConfig: state.context.gameConfig,
      gameScoreData: state.context.gameScoreData,
      lastLevelResults: state.context.levelResultsHistory.slice(
        -1
      )[0] as LevelResults,
    }));

  const lastLevelNumber = lastLevelResults.generationNumber;
  const lastLevelScore = lastLevelResults.scoreData.levelScore;

  return (
    <Group x={x} y={y}>
      {/* Background box */}
      <Rect
        width={width}
        height={height}
        x={0}
        y={0}
        opacity={0.75}
        fill="white"
        stroke="#a5c4fa"
        strokeWidth={5}
        cornerRadius={10}
        shadowBlur={5}
      />
      {/* Level Score */}
      <Group x={10} y={30}>
        <Text
          x={0}
          y={0}
          width={width - 20}
          align="center"
          text={`Finished level ${lastLevelNumber}!`}
          fontSize={24}
          fontFamily="Arco"
          height={24}
          verticalAlign="bottom"
          fill={gameConfig.colors.secondaryBlue}
        />
        <Text
          x={0}
          y={40}
          width={width - 20}
          align="center"
          text={`+${lastLevelScore.toLocaleString()} points`}
          fontSize={32}
          fontFamily="Arco"
          fill={gameConfig.colors.secondaryOrange}
          height={24}
          verticalAlign="bottom"
        />
      </Group>
      {/* Play Next Level Button */}
      <Button
        x={0.5 * width - 100}
        y={120}
        width={200}
        height={70}
        bgColor={gameConfig.colors.secondaryBlue}
        borderColor="white"
        textColor="white"
        text="Play"
        fontFamily="Arco"
        onClick={() => appActorRef.send({ type: 'Play' })}
      />
      {/* Game Score */}
      <Group x={10} y={200}>
        <Text
          x={0}
          y={0}
          width={width - 20}
          align="center"
          text="Total Score"
          fontSize={20}
          height={40}
          verticalAlign="bottom"
          fontFamily="Arco"
          fill={gameConfig.colors.secondaryBlue}
        />
        <Text
          x={0}
          y={50}
          width={width - 20}
          align="center"
          text={`${gameScoreData.gameScore.toLocaleString()}`}
          height={40}
          verticalAlign="bottom"
          fontSize={40}
          fontFamily="Arco"
          fill={gameConfig.colors.secondaryBlue}
        />
      </Group>
      {/* Game Egg Totals */}
      <Group x={12} y={310} width={width}>
        <EggTally
          eggColor="white"
          count={gameScoreData.eggsCaught.white}
          x={0}
          y={0}
          width={100}
          eggSize={40}
        />
        <EggTally
          eggColor="gold"
          count={gameScoreData.eggsCaught.gold}
          x={94}
          y={0}
          width={100}
          eggSize={40}
        />
        <EggTally
          eggColor="black"
          count={gameScoreData.eggsCaught.black}
          x={188}
          y={0}
          width={100}
          eggSize={40}
        />
      </Group>
    </Group>
  );
}
