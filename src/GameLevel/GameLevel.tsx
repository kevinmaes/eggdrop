import { useSelector } from '@xstate/react';
import { Layer, Text } from 'react-konva';

import { AppActorContext } from '../app.machine';
import { Chef } from '../Chef/Chef';
import { GAME_LEVEL_ACTOR_ID } from '../constants';
import { Egg } from '../Egg/Egg';
import { EggCaughtPoints } from '../EggCaughtPoints/EggCaughtPoints';
import { Hen } from '../Hen/Hen';
import { HensCountdown } from '../HensCountdown/HensCountdown';
import { LevelScoreBox } from '../LevelScoreBox/LevelScoreBox';

import { gameLevelMachine } from './gameLevel.machine';

import type { ActorRefFrom } from 'xstate';

export function GameLevel() {
  const appActorRef = AppActorContext.useActorRef();
  const { gameConfig, generationNumber } = AppActorContext.useSelector(
    state => ({
      gameConfig: state.context.gameConfig,
      generationNumber: state.context.generationNumber,
    })
  );

  const gameLevelActorRef = appActorRef.system.get(
    GAME_LEVEL_ACTOR_ID
  ) as ActorRefFrom<typeof gameLevelMachine>;

  const { henActorRefs, eggActorRefs, eggCaughtPointsActorRefs } = useSelector(
    gameLevelActorRef,
    state => {
      if (!state) {
        return {
          remainingMS: 0,
          henActorRefs: [],
          eggActorRefs: [],
          eggCaughtPointsActorRefs: [],
        };
      }
      return {
        remainingMS: state.context.remainingMS,
        henActorRefs: state.context.henActorRefs,
        eggActorRefs: state.context.eggActorRefs,
        eggCaughtPointsActorRefs: state.context.eggCaughtPointsActorRefs,
      };
    }
  );

  return (
    <>
      {/* Hen layer */}
      <Layer>
        {henActorRefs.map(henActorRef => (
          <Hen key={henActorRef.id} henActorRef={henActorRef} />
        ))}
      </Layer>

      {/* Chef and Egg layers (they interact) */}
      <Layer>
        <Chef />
        {eggActorRefs.map(eggActorRef => (
          <Egg key={eggActorRef.id} eggActorRef={eggActorRef} />
        ))}
        {eggCaughtPointsActorRefs.map(eggCaughtPointsActorRef => (
          <EggCaughtPoints
            key={eggCaughtPointsActorRef.id}
            eggCaughtPointsActorRefs={eggCaughtPointsActorRef}
          />
        ))}
      </Layer>

      {/* Game UI: Level Score, Timer */}
      <Layer>
        {/* Level number */}
        <Text
          x={gameConfig.stage.margin}
          y={gameConfig.henBeam.y + 5}
          text={`LEVEL ${generationNumber}`}
          fontSize={18}
          fontStyle="bold"
          fontFamily="Arco"
          fill={gameConfig.colors.primaryOrange}
          opacity={0.75}
        />
        <HensCountdown
          x={70}
          y={gameConfig.henBeam.y + gameConfig.henBeam.height + 10}
          width={gameConfig.hensCountdown.width}
          height={gameConfig.hensCountdown.height}
        />
        <LevelScoreBox
          x={gameConfig.stage.width - 120 - gameConfig.stage.margin}
          y={gameConfig.henBeam.y + gameConfig.henBeam.height + 10}
          width={120}
          height={320}
        />
      </Layer>
    </>
  );
}
