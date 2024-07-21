import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, log, sendParent, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';
import { henMachine } from '../Hen/hen.machine';
import { eggMachine, EggResultStatus } from '../Egg/egg.machine';
import { CHEF_DIMENSIONS, STAGE_DIMENSIONS } from './gameConfig';
import { GenerationStats, IndividualHen, Position } from './types';
import { gameTimerMachine } from './gameTimer.machine';
import { sounds } from '../sounds';

export const gameLevelMachine = setup({
	types: {} as {
		context: {
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
		};
		events:
			| { type: 'Time countdown tick' }
			| { type: 'Time countdown done' }
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
					resultStatus: EggResultStatus;
			  };
		input: {
			generationIndex: number;
			levelDuration: number;
			population: IndividualHen[];
		};
	},
	actions: {
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
								position: {
									x: initialPosition.x,
									y: initialPosition.y,
								},
								speed,
								baseTweenDurationSeconds,
								maxEggs,
								stationaryEggLayingRate,
								movingEggLayingRate,
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
				params: { henId: string; henPosition: Position; hatchRate: number }
			) => {
				const eggHenButtYOffset = 35;
				const eggId = nanoid();
				// Spawn and add a new egg.
				return [
					...context.eggActorRefs,
					spawn(eggMachine, {
						systemId: eggId,
						input: {
							id: eggId,
							henId: params.henId,
							position: {
								x: params.henPosition.x,
								y: params.henPosition.y + eggHenButtYOffset,
							},
							fallingSpeed: 2,
							floorY: context.stageDimensions.height,
							hatchRate: params.hatchRate,
						},
					}),
				];
			},
		}),
		updateHenStatsForEggLaid: assign(
			({ context }, params: { henId: string }) => {
				const updatedHenStatsById = {
					...context.henStatsById,
				};
				updatedHenStatsById[params.henId].eggsLaid += 1;

				const updatedLevelStats = {
					...context.levelStats,
					totalEggsLaid: context.levelStats.totalEggsLaid + 1,
				};

				return {
					levelStats: updatedLevelStats,
					henStatsById: updatedHenStatsById,
				};
			}
		),
		updateHenStatsForEggDone: assign(
			(
				{ context },
				params: {
					henId: string;
					eggId: string;
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
						console.log('resultStatus Caught');
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

				console.log(
					'updateHenStatsForEggDone',
					params.resultStatus,
					updatedLevelStats.totalEggsCaught
				);

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
	},
	guards: {
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
		remainingTime: input.levelDuration,
		stageDimensions: STAGE_DIMENSIONS,
		chefDimensions: CHEF_DIMENSIONS,
		// TODO: Increment the generationIndex.
		generationIndex: input.generationIndex,
		henActorRefs: [],
		eggActorRefs: [],
		chefPotRimHitRef: null,
		population: input.population,
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
			totalEggsHatched: 0,
			totalEggsLaid: 0,
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
						hatchRate: event.hatchRate,
					}),
				},
				'playEggLaidSound',
				{
					type: 'updateHenStatsForEggLaid',
					params: ({ event }) => ({ henId: event.henId }),
				},
			],
		},
		'Egg position updated': [
			{
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
		],
		'Egg done': {
			actions: [
				{
					type: 'updateHenStatsForEggDone',
					params: ({ event }) => ({
						henId: event.henId,
						eggId: event.eggId,
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
				'Time countdown tick': {
					actions: assign({
						remainingTime: ({ context }) => context.remainingTime - 1000,
					}),
				},
				'Time countdown done': 'Done',
			},
			invoke: [
				{
					src: gameTimerMachine,
					input: ({ context }) => ({
						remainingTime: context.remainingTime,
					}),
				},
				{
					id: 'chefMachine',
					src: 'chefMachine',
					systemId: 'chefMachine',
					input: ({ context }) => ({
						position: {
							x:
								context.stageDimensions.width / 2 -
								0.5 * context.chefDimensions.width,
							y:
								context.stageDimensions.height -
								context.chefDimensions.height -
								10,
						},
						speed: 0,
						speedLimit: 3,
						acceleration: 1,
						deceleration: 1,
						minXPos: 10,
						maxXPos:
							context.stageDimensions.width - context.chefDimensions.width - 10,
					}),
				},
			],
		},
		Done: {
			tags: 'summary',
			entry: [
				log('Game Level summary state'),
				'calculateLevelStatsAverages',
				'cleanupLevelRefs',
				sendParent(({ context }) => {
					console.log('sending parent context.levelStats', context.levelStats);
					return {
						type: 'Level complete',
						levelResults: {
							generationIndex: context.generationIndex,
							levelStats: context.levelStats,
							henStatsById: context.henStatsById,
						},
					};
				}),
			],
		},
	},
});
