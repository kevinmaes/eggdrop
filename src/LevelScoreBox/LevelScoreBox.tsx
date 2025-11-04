import React, { forwardRef, useEffect, useRef, useState } from 'react';

import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Group, Rect, Text, type KonvaNodeEvents } from 'react-konva';

import { AppActorContext } from '../app.machine';
import { GAME_LEVEL_ACTOR_ID } from '../constants';
import { EggTally } from '../EggTally/EggTally';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';

import type { Group as KonvaGroup } from 'konva/lib/Group';
import type { ActorRefFrom } from 'xstate';

interface ShakableGroupProps extends KonvaNodeEvents {
  children?: React.ReactNode;
  x: number;
  y: number;
}

const ShakableGroup = forwardRef<KonvaGroup, ShakableGroupProps>(
  (props, ref) => (
    <Group ref={ref} {...props}>
      {props.children}
    </Group>
  )
);

export function LevelScoreBox({
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
  const gameScoreData = AppActorContext.useSelector(
    (state) => state.context.gameScoreData
  );
  const gameLevelActorRef = appActorRef.system.get(
    GAME_LEVEL_ACTOR_ID
  ) as ActorRefFrom<typeof gameLevelMachine>;

  const { gameConfig, scoreData } = useSelector(gameLevelActorRef, (state) => ({
    gameConfig: state?.context.gameConfig ?? null,
    scoreData: state?.context.scoreData ?? {
      levelScore: 0,
      eggsCaught: {
        white: 0,
        gold: 0,
        black: 0,
      },
    },
  }));

  const [animateForBlackEggCaught, setAnimateForBlackEggCaught] =
    useState(false);
  useEffect(() => {
    gameLevelActorRef.on('Egg caught', (event) => {
      if (event.eggColor === 'black') {
        setAnimateForBlackEggCaught(true);
      }
    });
  }, [gameLevelActorRef]);

  const boxRef = useRef<Konva.Group>(null);

  useEffect(() => {
    const rect = boxRef.current;
    if (!rect || !animateForBlackEggCaught) {
      return;
    }

    // Define the shaking tween
    const shakeTween = new Konva.Tween({
      node: rect,
      duration: 0.05, // Time per shake movement
      x: rect.x() + 5, // Move 5px to the right initially
      easing: Konva.Easings.EaseInOut,
      yoyo: true, // Back and forth effect
      repeat: 10, // Number of shakes (for a total of ~1 second)
    });

    // Start shaking
    shakeTween.play();

    // Stop the shake after 1 second
    const timeout = setTimeout(() => {
      shakeTween.destroy(); // Stop the tween
      setAnimateForBlackEggCaught(false); // Reset the state
    }, 1000);

    return () => clearTimeout(timeout); // Clean up on component unmount
  }, [animateForBlackEggCaught]);

  const anticipatedGameScore =
    gameScoreData.gameScore + (scoreData?.levelScore ?? 0);

  if (!gameConfig) {
    return null;
  }

  return (
    <ShakableGroup ref={boxRef} x={x} y={y}>
      {/* Background box */}
      <Rect
        width={width}
        height={height}
        x={0}
        y={0}
        opacity={0.75}
        fill="white"
        stroke="#a5c4fa"
        strokeWidth={4}
        cornerRadius={10}
      />
      {/* Level Score */}
      <Group x={10} y={15}>
        <Text
          x={0}
          y={0}
          width={100}
          align="center"
          text="Score"
          fontSize={24}
          fontFamily="Arco"
          height={24}
          verticalAlign="bottom"
          fill={
            animateForBlackEggCaught
              ? 'black'
              : gameConfig.colors.secondaryOrange
          }
        />
        <Text
          x={0}
          y={40}
          width={100}
          align="center"
          text={`${scoreData.levelScore.toLocaleString()}`}
          fontSize={32}
          fontFamily="Arco"
          fill={
            animateForBlackEggCaught
              ? 'black'
              : gameConfig.colors.secondaryOrange
          }
          height={24}
          verticalAlign="bottom"
        />
      </Group>
      {/* Egg Tally for white, gold, black eggs */}
      <Group x={20} y={100}>
        <EggTally
          eggColor="white"
          count={scoreData.eggsCaught.white}
          x={0}
          y={0}
        />
        <EggTally
          eggColor="gold"
          count={scoreData.eggsCaught.gold}
          x={0}
          y={45}
        />
        <EggTally
          eggColor="black"
          count={scoreData.eggsCaught.black}
          x={0}
          y={90}
        />
      </Group>
      {/* Game Score */}
      <Group x={10} y={210}>
        <Text
          x={0}
          y={0}
          verticalAlign="bottom"
          width={100}
          height={64}
          align="center"
          text="Total Score"
          fontSize={16}
          fontFamily="Arco"
          fill={gameConfig.colors.secondaryBlue}
        />
        <Text
          x={0}
          y={65}
          width={100}
          align="center"
          text={`${anticipatedGameScore.toLocaleString()}`}
          fontSize={16}
          fontFamily="Arco"
          fill={gameConfig.colors.secondaryBlue}
          height={24}
          verticalAlign="bottom"
        />
      </Group>
    </ShakableGroup>
  );
}
