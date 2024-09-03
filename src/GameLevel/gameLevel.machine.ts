import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, log, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';
import { henMachine } from '../Hen/hen.machine';
import { eggMachine, EggResultStatus } from '../Egg/egg.machine';
import { getGameConfig } from './gameConfig';
import { GenerationStats, IndividualHen, LevelResults } from './types';
import { sounds } from '../sounds';
import { GameAssets } from '../types/assets';
import { countdownTimer } from './countdownTimer.actor';
import { Direction, Position } from '../types';

export const gameLevelMachine = setup({
	types: {} as {
		input: {
			gameConfig: ReturnType<typeof getGameConfig>;
			gameAssets: GameAssets;
			generationNumber: number;
			levelDuration: number;
			population: IndividualHen[];
		};
		output: LevelResults;
		context: {
			gameConfig: ReturnType<typeof getGameConfig>;
			gameAssets: GameAssets;
			remainingMS: number;
			generationNumber: number;
			henActorRefs: ActorRefFrom<typeof henMachine>[];
			eggActorRefs: ActorRefFrom<typeof eggMachine>[];
			chefPotRimHitRef: React.RefObject<Rect> | null;
			nextHenIndex: number;
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
					henCurrentTweenDirection: Direction['value'];
					eggColor: 'white' | 'gold' | 'black';
					hatchRate: number;
			  }
			| {
					type: 'Egg position updated';
					eggId: string;
					position: Position;
			  }
			| { type: 'Tick'; remainingMS: number; done: boolean };
	},
	actions: {
		countdownTick: assign({
			remainingMS: (_, params: { remainingMS: number }) => params.remainingMS,
		}),
		removeHenActorRef: assign({
			henActorRefs: ({ context }, params: { henId: string }) => {
				const filteredHenActorRefs = context.henActorRefs.filter(
					(henActorRef) =>
						// TODO Should be able to assign the egg an id and compare that
						// but spawn has a type error.
						henActorRef.getSnapshot().context.id !== params.henId
				);
				console.log('filteredHenActorRefs', filteredHenActorRefs);
				return filteredHenActorRefs;
			},
		}),
		removeEggActorRef: assign({
			eggActorRefs: ({ context }, params: { eggId: string }) => {
				const filteredEggActorRefs = context.eggActorRefs.filter(
					(eggActorRef) =>
						// TODO Should be able to assign the egg an id and compare that
						// but spawn has a type error.
						eggActorRef.getSnapshot().context.id !== params.eggId
				);
				console.log('filteredEggActorRefs', filteredEggActorRefs);
				return filteredEggActorRefs;
			},
		}),
		spawnNewHen: assign(({ context, spawn }) => {
			const index = context.nextHenIndex;
			const henConfig = context.population[index];

			if (index >= context.population.length) {
				console.warn('No more hens to spawn');
				return {};
			}

			const nextHen = spawn(henMachine, {
				systemId: henConfig.id,
				input: {
					index: index,
					gameConfig: context.gameConfig,
					id: henConfig.id,
					henAssets: context.gameAssets.hen,
					position: {
						x: henConfig.initialPosition.x,
						y: henConfig.initialPosition.y,
					},
					speed: henConfig.speed,
					baseTweenDurationSeconds: henConfig.baseTweenDurationSeconds,
					maxEggs: henConfig.maxEggs,
					stationaryEggLayingRate: henConfig.stationaryEggLayingRate,
					movingEggLayingRate: henConfig.movingEggLayingRate,
					restAfterLayingEggMS: henConfig.restAfterLayingEggMS,
					blackEggRate: henConfig.blackEggRate,
					goldEggRate: henConfig.goldEggRate,
					hatchRate: henConfig.hatchRate,
					minXMovement: henConfig.minXMovement,
					maxXMovement: henConfig.maxXMovement,
					minStopMS: henConfig.minStopMS,
					maxStopMS: henConfig.maxStopMS,
				},
			});
			const newHenActorRefs = [...context.henActorRefs, nextHen];

			console.log('newHenActorRefs length', newHenActorRefs.length);
			return {
				henActorRefs: newHenActorRefs,
				nextHenIndex: index + 1,
			};
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
					henCurrentTweenDirection: Direction['value'];
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
							rotationDirection: (-1 *
								params.henCurrentTweenDirection) as Direction['value'],
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
						// Update eggs caught, tracked by color
						updatedHenStats.eggsCaught[params.eggColor] += 1;

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
					generationNumber: context.generationNumber,
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
					averageMinXMovement:
						context.population.reduce((acc, hen) => acc + hen.minXMovement, 0) /
						totalHens,
					averageMaxXMovement:
						context.population.reduce((acc, hen) => acc + hen.maxXMovement, 0) /
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
		isAnEggActorDone: (_, params: { eggId: string }) => {
			return !!params.eggId;
		},
		isAHenActorDone: (_, params: { henId: string }) => {
			return !!params.henId;
		},
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
		generationNumber: input.generationNumber,
		henActorRefs: [],
		eggActorRefs: [],
		chefPotRimHitRef: null,
		nextHenIndex: 0,
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
			averageMinXMovement: 0,
			averageMaxXMovement: 0,
			averageMinStopMS: 0,
			averageMaxStopMS: 0,
			generationNumber: 1,
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
		generationNumber: context.generationNumber,
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
	},
	states: {
		Playing: {
			entry: [
				// 'spawnNewHens',
				'startBackgroundMusic',
			],
			exit: 'stopBackgroundMusic',
			on: {
				Tick: [
					// {
					// 	guard: {
					// 		type: 'isCountdownDone',
					// 		params: ({ event }) => ({ done: event.done }),
					// 	},
					// 	target: 'Done',
					// },
					{
						actions: [
							{
								type: 'countdownTick',
								params: ({ event }) => ({ remainingMS: event.remainingMS }),
							},
							'spawnNewHen',
						],
					},
				],
				'xstate.done.actor.*': [
					{
						guard: {
							type: 'isAnEggActorDone',
							params: ({ event }) => ({ eggId: event.output.eggId }),
						},
						actions: [
							log('Egg done'),
							{
								type: 'removeEggActorRef',
								params: ({ event }) => ({ eggId: event.output.eggId }),
							},
							{
								type: 'updateScoreForEggDone',
								params: ({ event }) => ({
									henId: event.output.henId,
									eggId: event.output.eggId,
									eggColor: event.output.eggColor,
									resultStatus: event.output.resultStatus,
								}),
							},
							{
								type: 'updateHenStatsForEggDone',
								params: ({ event }) => ({
									henId: event.output.henId,
									eggId: event.output.eggId,
									eggColor: event.output.eggColor,
									resultStatus: event.output.resultStatus,
								}),
							},
						],
					},
					{
						guard: {
							type: 'isAHenActorDone',
							params: ({ event }) => ({ henId: event.output.henId }),
						},
						actions: [
							log('Hen done'),
							{
								type: 'removeHenActorRef',
								params: ({ event }) => ({ henId: event.output.henId }),
							},
						],
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
