import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, log, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';
import { henMachine } from '../Hen/hen.machine';
import { eggMachine, EggResultStatus } from '../Egg/egg.machine';
import { getGameConfig } from './gameConfig';
import {
	GenerationStats,
	IndividualHen,
	LevelResults,
	Position,
} from './types';
import { sounds } from '../sounds';
import { GameAssets } from '../types/assets';
import { countdownTimer } from './countdownTimer.actor';

export const gameLevelMachine = setup({
	types: {} as {
		input: {
			gameConfig: ReturnType<typeof getGameConfig>;
			gameAssets: GameAssets;
			generationIndex: number;
			levelDuration: number;
			population: IndividualHen[];
		};
		output: LevelResults;
		context: {
			gameConfig: ReturnType<typeof getGameConfig>;
			gameAssets: GameAssets;
			remainingMS: number;
			generationIndex: number;
			henActorRefs: ActorRefFrom<typeof henMachine>[];
			eggActorRefs: ActorRefFrom<typeof eggMachine>[];
			chefPotRimHitRef: React.RefObject<Rect> | null;
			levelStats: GenerationStats;
			henStatsById: Record<string, IndividualHen>;
			population: IndividualHen[];
			scoreData: {
				levelScore: number;
				eggsCaught: {
					white: number;
					gold: number;
					black: number;
				};
			};
		};
		events:
			| { type: 'Pause game' }
			| { type: 'Resume game' }
			| {
					type: 'Set chefPotRimHitRef';
					chefPotRimHitRef: React.RefObject<Rect>;
			  }
			| {
					type: 'Lay an egg';
					henId: string;
					henPosition: Position;
					henCurentTweenSpeed: number;
					henCurrentTweenDirection: -1 | 0 | 1;
					eggColor: 'white' | 'gold' | 'black';
					hatchRate: number;
			  }
			| {
					type: 'Egg position updated';
					eggId: string;
					position: Position;
			  }
			| {
					type: 'Egg done';
					henId: string;
					eggId: string;
					eggColor: 'white' | 'gold' | 'black';
					resultStatus: EggResultStatus;
			  }
			| { type: 'Tick'; remainingMS: number; done: boolean };
	},
	actions: {
		countdownTick: assign({
			remainingMS: (_, params: { remainingMS: number }) => params.remainingMS,
		}),
		spawnNewHens: assign({
			henActorRefs: ({ context, spawn }) =>
				context.population.map(
					({
						id: henId,
						initialPosition,
						speed,
						baseTweenDurationSeconds,
						maxEggs,
						stationaryEggLayingRate,
						movingEggLayingRate,
						restAfterLayingEggMS,
						blackEggRate,
						goldEggRate,
						hatchRate,
						minX,
						maxX,
						minStopMS,
						maxStopMS,
					}) =>
						spawn(henMachine, {
							systemId: henId,
							input: {
								gameConfig: context.gameConfig,
								id: henId,
								henAssets: context.gameAssets.hen,
								position: {
									x: initialPosition.x,
									y: initialPosition.y,
								},
								speed,
								baseTweenDurationSeconds,
								maxEggs,
								stationaryEggLayingRate,
								movingEggLayingRate,
								restAfterLayingEggMS,
								blackEggRate,
								goldEggRate,
								hatchRate,
								minX,
								maxX,
								minStopMS,
								maxStopMS,
							},
						})
				),
		}),
		spawnNewEggForHen: assign({
			eggActorRefs: (
				{ context, spawn },
				params: {
					henId: string;
					henPosition: Position;
					henCurentTweenSpeed: number;
					henButtXOffset: number;
					henButtYOffset: number;
					henCurrentTweenDirection: -1 | 0 | 1;
					eggColor: 'white' | 'gold' | 'black';
					hatchRate: number;
				}
			) => {
				const eggId = nanoid();
				// Spawn and add a new egg.
				return [
					...context.eggActorRefs,
					spawn(eggMachine, {
						systemId: eggId,
						input: {
							gameConfig: context.gameConfig,
							id: eggId,
							eggAssets: context.gameAssets.egg,
							chickAssets: context.gameAssets.chick,
							position: {
								x: params.henPosition.x + params.henButtXOffset,
								y: params.henPosition.y + params.henButtYOffset,
							},
							color: params.eggColor,
							henId: params.henId,
							henIsMoving: params.henCurentTweenSpeed > 0,
							henCurentTweenSpeed: params.henCurentTweenSpeed,
							rotationDirection: (-1 * params.henCurrentTweenDirection) as
								| -1
								| 0
								| 1,
							hatchRate: params.hatchRate,
						},
					}),
				];
			},
		}),
		updateHenStatsForEggLaid: assign(
			(
				{ context },
				params: {
					henId: string;
					eggColor: 'white' | 'gold' | 'black';
				}
			) => {
				const updatedHenStatsById = {
					...context.henStatsById,
				};
				updatedHenStatsById[params.henId].eggsLaid += 1;

				const updatedLevelStats = {
					...context.levelStats,
					totalEggsLaid: context.levelStats.totalEggsLaid + 1,
				};

				if (params.eggColor === 'black') {
					updatedLevelStats.totalBlackEggsLaid += 1;
				} else if (params.eggColor === 'gold') {
					updatedLevelStats.totalGoldEggsLaid += 1;
				} else {
					updatedLevelStats.totalWhiteEggsLaid += 1;
				}

				return {
					levelStats: updatedLevelStats,
					henStatsById: updatedHenStatsById,
				};
			}
		),
		updateScoreForEggDone: assign({
			scoreData: (
				{ context },
				params: {
					henId: string;
					eggId: string;
					eggColor: 'white' | 'gold' | 'black';
					resultStatus: EggResultStatus;
				}
			) => {
				if (params.resultStatus === 'Caught') {
					const newScoreData = { ...context.scoreData };

					// Increment the egg count for the color caught
					newScoreData.eggsCaught[params.eggColor] += 1;

					// Increment the level score based on the egg color
					if (params.eggColor === 'black') {
						// Wipe out the level score if a black egg is caught
						newScoreData.levelScore = 0;
					} else {
						newScoreData.levelScore +=
							context.gameConfig.egg.points[params.eggColor];
					}

					return newScoreData;
				}
				return context.scoreData;
			},
		}),
		updateHenStatsForEggDone: assign(
			(
				{ context },
				params: {
					henId: string;
					eggId: string;
					eggColor: 'white' | 'gold' | 'black';
					resultStatus: EggResultStatus;
				}
			) => {
				const updatedHenStatsById = {
					...context.henStatsById,
				};

				const updatedHenStats = {
					...context.henStatsById[params.henId],
				};

				const updatedLevelStats = {
					...context.levelStats,
				};

				switch (params.resultStatus) {
					case 'Caught':
						updatedHenStats.eggsCaught += 1;
						updatedLevelStats.totalEggsCaught += 1;
						if (params.eggColor === 'black') {
							updatedLevelStats.totalBlackEggsCaught += 1;
						} else if (params.eggColor === 'gold') {
							updatedLevelStats.totalGoldEggsCaught += 1;
						} else {
							updatedLevelStats.totalWhiteEggsCaught += 1;
						}
						break;
					case 'Hatched':
						updatedHenStats.eggsHatched += 1;
						updatedLevelStats.totalEggsHatched += 1;
						break;
					case 'Broken':
						updatedHenStats.eggsBroken += 1;
						updatedLevelStats.totalEggsBroken += 1;
						break;
				}

				updatedHenStatsById[params.henId] = updatedHenStats;

				return {
					henStatsById: updatedHenStatsById,
					levelStats: updatedLevelStats,
				};
			}
		),
		calculateLevelStatsAverages: assign({
			levelStats: ({ context }) => {
				const totalHens = context.population.length;

				return {
					...context.levelStats,
					generationIndex: context.generationIndex,
					averageEggsLaid: context.levelStats.totalEggsLaid / totalHens,
					averageEggsCaught: context.levelStats.totalEggsCaught / totalHens,
					averageEggsHatched: context.levelStats.totalEggsHatched / totalHens,
					averageEggsBroken: context.levelStats.totalEggsBroken / totalHens,
					averageStationaryEggLayingRate:
						context.population.reduce(
							(acc, hen) => acc + hen.stationaryEggLayingRate,
							0
						) / totalHens,
					averageHenSpeed:
						context.population.reduce((acc, hen) => acc + hen.speed, 0) /
						totalHens,
					averageHatchRate:
						context.population.reduce((acc, hen) => acc + hen.hatchRate, 0) /
						totalHens,
					averageMinX:
						context.population.reduce((acc, hen) => acc + hen.minX, 0) /
						totalHens,
					averageMaxX:
						context.population.reduce((acc, hen) => acc + hen.maxX, 0) /
						totalHens,
					averageMinStopMS:
						context.population.reduce((acc, hen) => acc + hen.minStopMS, 0) /
						totalHens,
					averageMaxStopMS:
						context.population.reduce((acc, hen) => acc + hen.maxStopMS, 0) /
						totalHens,
					catchRate:
						context.levelStats.totalEggsCaught /
						context.levelStats.totalEggsLaid,
				};
			},
		}),
		startBackgroundMusic: () => {
			sounds.backgroundLoop.play();
		},
		stopBackgroundMusic: () => {
			sounds.backgroundLoop.stop();
		},
		playEggLaidSound: () => {
			sounds.layEgg.play();
		},
		playCatchEggSound: () => {
			sounds.catch.play();
		},
		cleanupLevelRefs: assign({
			henActorRefs: [],
			eggActorRefs: [],
		}),
	},
	actors: {
		chefMachine,
		countdownTimer,
	},
	guards: {
		isCountdownDone: (_, params: { done: boolean }) => params.done,
		testPotRimHit: ({ context }, params: Position) => {
			if (!context.chefPotRimHitRef?.current) {
				return false;
			}

			// Pot rim hit box
			const {
				x: potRimHitX,
				y: potRimHitY,
				width: potRimHitWidth,
				height: potRimHitHeight,
			} = context.chefPotRimHitRef.current?.getClientRect();

			// Consider the leading edge of the egg for the hit test
			const eggLeadingEdgeYPos =
				params.y + 0.5 * context.gameConfig.egg.fallingEgg.height;

			if (eggLeadingEdgeYPos < potRimHitY) {
				return false;
			}

			return (
				params.x >= potRimHitX &&
				params.x <= potRimHitX + potRimHitWidth &&
				eggLeadingEdgeYPos >= potRimHitY &&
				eggLeadingEdgeYPos <= potRimHitY + potRimHitHeight
			);
		},
	},
}).createMachine({
	context: ({ input }) => ({
		gameConfig: input.gameConfig,
		gameAssets: input.gameAssets,
		remainingMS: input.levelDuration,
		generationIndex: input.generationIndex,
		henActorRefs: [],
		eggActorRefs: [],
		chefPotRimHitRef: null,
		population: input.population,
		scoreData: {
			levelScore: 0,
			eggsCaught: {
				white: 0,
				gold: 0,
				black: 0,
			},
		},
		levelStats: {
			averageEggsBroken: 0,
			averageEggsHatched: 0,
			averageEggsLaid: 0,
			averageStationaryEggLayingRate: 0,
			averageHenSpeed: 0,
			averageHatchRate: 0,
			averageMinX: 0,
			averageMaxX: 0,
			averageMinStopMS: 0,
			averageMaxStopMS: 0,
			generationIndex: 0,
			totalEggsBroken: 0,
			totalEggsCaught: 0,
			totalBlackEggsCaught: 0,
			totalGoldEggsCaught: 0,
			totalWhiteEggsCaught: 0,
			totalEggsHatched: 0,
			totalEggsLaid: 0,
			totalBlackEggsLaid: 0,
			totalGoldEggsLaid: 0,
			totalWhiteEggsLaid: 0,
			totalEggsSplat: 0,
			catchRate: 0,
		},
		henStatsById: input.population.reduce(
			(acc, individualHenConfig) => ({
				...acc,
				[individualHenConfig.id]: individualHenConfig,
			}),
			{}
		),
	}),
	output: ({ context }) => ({
		generationIndex: context.generationIndex,
		levelStats: context.levelStats,
		henStatsById: context.henStatsById,
		scoreData: context.scoreData,
	}),
	initial: 'Playing',
	on: {
		'Set chefPotRimHitRef': {
			actions: assign({
				chefPotRimHitRef: ({ event }) => event.chefPotRimHitRef,
			}),
		},
		'Lay an egg': {
			actions: [
				{
					type: 'spawnNewEggForHen',
					params: ({ context, event }) => ({
						henId: event.henId,
						henPosition: event.henPosition,
						henButtXOffset: context.gameConfig.hen.buttXOffset,
						henButtYOffset: context.gameConfig.hen.buttYOffset,
						henCurentTweenSpeed: event.henCurentTweenSpeed,
						henCurrentTweenDirection: event.henCurrentTweenDirection,
						eggColor: event.eggColor,
						hatchRate: event.hatchRate,
					}),
				},
				'playEggLaidSound',
				{
					type: 'updateHenStatsForEggLaid',
					params: ({ event }) => ({
						henId: event.henId,
						eggColor: event.eggColor,
					}),
				},
			],
		},
		'Egg position updated': {
			guard: {
				type: 'testPotRimHit',
				params: ({ event }) => event.position,
			},
			actions: [
				sendTo('chefMachine', { type: 'Catch' }),
				'playCatchEggSound',
				// Sending Catch to the eggActor will lead to final state
				// and automatic removal by this parent machine.
				sendTo(({ system, event }) => system.get(event.eggId), {
					type: 'Catch',
				}),
			],
		},
		'Egg done': {
			actions: [
				{
					type: 'updateScoreForEggDone',
					params: ({ event }) => ({
						henId: event.henId,
						eggId: event.eggId,
						eggColor: event.eggColor,
						resultStatus: event.resultStatus,
					}),
				},
				{
					type: 'updateHenStatsForEggDone',
					params: ({ event }) => ({
						henId: event.henId,
						eggId: event.eggId,
						eggColor: event.eggColor,
						resultStatus: event.resultStatus,
					}),
				},
				assign({
					eggActorRefs: ({ context, event }) =>
						context.eggActorRefs.filter(
							(eggActorRef) =>
								// TODO Should be able to assign the egg an id and compare that
								// but spawn has a type error.
								eggActorRef.getSnapshot().context.id !== event.eggId
						),
				}),
			],
		},
	},
	states: {
		Playing: {
			entry: ['spawnNewHens', 'startBackgroundMusic'],
			exit: 'stopBackgroundMusic',
			on: {
				Tick: [
					{
						guard: {
							type: 'isCountdownDone',
							params: ({ event }) => ({ done: event.done }),
						},
						target: 'Done',
					},
					{
						actions: {
							type: 'countdownTick',
							params: ({ event }) => ({ remainingMS: event.remainingMS }),
						},
					},
				],
			},
			invoke: [
				{
					id: 'countdownTimer',
					src: 'countdownTimer',
					input: ({ context }) => ({
						totalMS: context.remainingMS,
						tickMS: 1000,
					}),
				},
				{
					id: 'chefMachine',
					src: 'chefMachine',
					systemId: 'chefMachine',
					input: ({ context }) => ({
						chefConfig: context.gameConfig.chef,
						chefAssets: context.gameAssets.chef,
						position: {
							x: context.gameConfig.chef.x,
							y: context.gameConfig.chef.y,
						},
						speed: 0,
						speedLimit: context.gameConfig.chef.speedLimit,
						acceleration: context.gameConfig.chef.acceleration,
						deceleration: context.gameConfig.chef.acceleration,
						minXPos: context.gameConfig.chef.minXPos,
						maxXPos: context.gameConfig.chef.maxXPos,
					}),
				},
			],
		},
		Done: {
			type: 'final',
			tags: 'summary',
			entry: [
				log('Game Level summary state'),
				'calculateLevelStatsAverages',
				'cleanupLevelRefs',
			],
		},
	},
});
