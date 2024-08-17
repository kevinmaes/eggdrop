import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, sendParent, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';
import { henMachine } from '../Hen/hen.machine';
import { eggMachine, EggResultStatus } from '../Egg/egg.machine';
import { CHEF_CONFIG, EGG_CONFIG, STAGE_DIMENSIONS } from './gameConfig';
import { GenerationStats, IndividualHen, Position } from './types';
import { sounds } from '../sounds';
import { GameAssets } from '../types/assets';
import { countdownTimer } from './countdownTimer.actor';

export const gameLevelMachine = setup({
	types: {} as {
		input: {
			gameAssets: GameAssets;
			generationIndex: number;
			levelDuration: number;
			population: IndividualHen[];
			score: number;
		};
		output: {
			score: number;
		};
		context: {
			gameAssets: GameAssets;
			remainingTime: number;
			stageDimensions: { width: number; height: number };
			chefDimensions: { width: number; height: number };
			generationIndex: number;
			henActorRefs: ActorRefFrom<typeof henMachine>[];
			eggActorRefs: ActorRefFrom<typeof eggMachine>[];
			chefPotRimHitRef: React.RefObject<Rect> | null;
			levelStats: GenerationStats;
			henStatsById: Record<string, IndividualHen>;
			population: IndividualHen[];
			score: number;
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
			remainingTime: (_, params: { remainingMS: number }) => params.remainingMS,
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
								stageDimensions: context.stageDimensions,
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
					henCurrentTweenDirection: -1 | 0 | 1;
					eggColor: 'white' | 'gold' | 'black';
					hatchRate: number;
				}
			) => {
				const eggHenButtYOffset = 35;
				const eggId = nanoid();
				// Spawn and add a new egg.
				return [
					...context.eggActorRefs,
					spawn(eggMachine, {
						systemId: eggId,
						input: {
							eggConfig: EGG_CONFIG,
							id: eggId,
							position: {
								x: params.henPosition.x,
								y: params.henPosition.y + eggHenButtYOffset,
							},
							color: params.eggColor,
							henId: params.henId,
							henIsMoving: params.henCurentTweenSpeed > 0,
							henCurentTweenSpeed: params.henCurentTweenSpeed,
							rotationDirection: (-1 * params.henCurrentTweenDirection) as
								| -1
								| 0
								| 1,
							floorY: context.stageDimensions.height,
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
			score: (
				{ context },
				params: {
					henId: string;
					eggId: string;
					eggColor: 'white' | 'gold' | 'black';
					resultStatus: EggResultStatus;
				}
			) => {
				if (params.resultStatus === 'Caught') {
					return context.score + EGG_CONFIG.points[params.eggColor];
				}
				return context.score;
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
		isCountdownDone: (_, params: { done: boolean }) => {
			console.log('guard isCountdownDone', params.done);
			return params.done;
		},
		testPotRimHit: ({ context, event }) => {
			if (!context.chefPotRimHitRef?.current) {
				return false;
			}
			if (!('position' in event)) {
				return false;
			}

			const { position } = event;

			// Pot rim hit box
			const {
				x: potRimHitX,
				y: potRimHitY,
				width: potRimHitWidth,
				height: potRimHitHeight,
			} = context.chefPotRimHitRef.current?.getClientRect();

			if (position.y < potRimHitY) {
				return false;
			}

			return (
				position.x >= potRimHitX &&
				position.x <= potRimHitX + potRimHitWidth &&
				position.y >= potRimHitY &&
				position.y <= potRimHitY + potRimHitHeight
			);
		},
	},
}).createMachine({
	context: ({ input }) => ({
		gameAssets: input.gameAssets,
		remainingTime: input.levelDuration,
		stageDimensions: STAGE_DIMENSIONS,
		chefDimensions: CHEF_CONFIG,
		generationIndex: input.generationIndex,
		henActorRefs: [],
		eggActorRefs: [],
		chefPotRimHitRef: null,
		population: input.population,
		score: input.score,
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
					params: ({ event }) => ({
						henId: event.henId,
						henPosition: event.henPosition,
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
			guard: 'testPotRimHit',
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
						totalMS: context.remainingTime,
						tickMS: 1000,
					}),
				},
				{
					id: 'chefMachine',
					src: 'chefMachine',
					systemId: 'chefMachine',
					input: ({ context }) => ({
						chefAssets: context.gameAssets.chef,
						position: {
							x: CHEF_CONFIG.x,
							y: CHEF_CONFIG.y,
						},
						speed: 0,
						speedLimit: CHEF_CONFIG.speedLimit,
						acceleration: CHEF_CONFIG.acceleration,
						deceleration: CHEF_CONFIG.acceleration,
						minXPos: CHEF_CONFIG.minXPos,
						maxXPos: CHEF_CONFIG.maxXPos,
					}),
				},
			],
		},
		Done: {
			tags: 'summary',
			entry: [
				// log('Game Level summary state'),
				'calculateLevelStatsAverages',
				'cleanupLevelRefs',
				sendParent(({ context }) => {
					return {
						type: 'Level complete',
						levelResults: {
							generationIndex: context.generationIndex,
							levelStats: context.levelStats,
							henStatsById: context.henStatsById,
							score: context.score,
						},
					};
				}),
			],
		},
	},
});
