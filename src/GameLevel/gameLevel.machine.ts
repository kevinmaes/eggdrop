import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, log, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';
import { getStartXPosition, henMachine } from '../Hen/hen.machine';
import { eggMachine, EggResultStatus } from '../Egg/egg.machine';
import { CHEF_DIMENSIONS, STAGE_DIMENSIONS } from './gameConfig';
import { GenerationStats, HenStats, Position } from './types';
import { gameTimerMachine } from './gameTimer.machine';

export interface GenerationSnapshot {
	stats: GenerationStats;
	henStatsById: Record<string, HenStats>;
}

const henConfigs = new Array(10).fill(null).map(() => ({
	id: nanoid(),
	initialX: getStartXPosition(1920),
	initialY: 10,
}));

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
			aggregateHenStats: GenerationStats;
			henStatsById: Record<string, HenStats>;
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
			levelDuration: number;
		};
	},
	actions: {
		spawnNewHen: assign({
			henActorRefs: ({ context, spawn }) =>
				henConfigs.map(({ id: henId, initialX, initialY }) =>
					spawn(henMachine, {
						systemId: henId,
						input: {
							id: henId,
							position: {
								x: initialX,
								y: initialY,
							},
							speed: Math.random(),
							baseAnimationDuration: 3,
							stageDimensions: context.stageDimensions,
							maxEggs: -1,
							stationaryEggLayingRate: 0.9,
							movingEggLayingRate: 0.1,
						},
					})
				),
		}),
		spawnNewEggForHen: assign({
			eggActorRefs: (
				{ context, spawn },
				params: { henId: string; henPosition: Position }
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
						},
					}),
				];
			},
		}),
		updateHenStatsForEggLayed: assign(
			({ context }, params: { henId: string }) => {
				const updatedHenStatsById = {
					...context.henStatsById,
				};
				const existingHenStats = context.henStatsById[params.henId];

				if (existingHenStats) {
					updatedHenStatsById[params.henId] = {
						...existingHenStats,
						eggsLayed: existingHenStats.eggsLayed + 1,
					};
				} else {
					updatedHenStatsById[params.henId] = {
						id: params.henId,
						eggsLayed: 1,
						eggsCaught: 0,
						eggsHatched: 0,
						eggsBroken: 0,
					};
				}

				const updatedAggregateHenStats = {
					...context.aggregateHenStats,
					totalEggsLayed: context.aggregateHenStats.totalEggsLayed + 1,
				};

				return {
					aggregateHenStats: updatedAggregateHenStats,
					henStatsById: updatedHenStatsById,
				};
			}
		),
		updateHenStatsForEggDone: assign({
			henStatsById: (
				{ context },
				params: {
					henId: string;
					eggId: string;
					resultStatus: EggResultStatus;
				}
			) => {
				const updatedHenStats = {
					...context.henStatsById[params.henId],
				};

				switch (params.resultStatus) {
					case 'Caught':
						updatedHenStats.eggsCaught += 1;
						break;
					case 'Hatched':
						updatedHenStats.eggsHatched += 1;
						break;
					case 'Broken':
						updatedHenStats.eggsBroken += 1;
						break;
				}

				return {
					...context.henStatsById,
					[params.henId]: updatedHenStats,
				};
			},
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
		'egg hits the floor': ({ context, event }) => {
			if (!('position' in event)) {
				return false;
			}
			return event.position.y >= context.stageDimensions.height - 15;
		},
	},
}).createMachine({
	context: ({ input }) => ({
		remainingTime: input.levelDuration,
		stageDimensions: STAGE_DIMENSIONS,
		chefDimensions: CHEF_DIMENSIONS,
		// TODO: Increment the generationIndex.
		generationIndex: 0,
		henActorRefs: [],
		eggActorRefs: [],
		chefPotRimHitRef: null,
		aggregateHenStats: {
			averageEggsBroken: 0,
			averageEggsHatched: 0,
			averageEggsLayed: 0,
			averageEggsSplat: 0,
			averageHenSpeedLimit: 0,
			generationIndex: 0,
			totalEggsBroken: 0,
			totalEggsCaught: 0,
			totalEggsHatched: 0,
			totalEggsLayed: 0,
			totalEggsSplat: 0,
		},
		henStatsById: {},
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
					}),
				},
				{
					type: 'updateHenStatsForEggLayed',
					params: ({ event }) => ({ henId: event.henId }),
				},
			],
		},
		'Egg position updated': [
			{
				guard: 'testPotRimHit',
				actions: [
					sendTo('chefMachine', { type: 'Catch' }),
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
			entry: 'spawnNewHen',
			on: {
				'Time countdown tick': {
					actions: [
						log('Time countdown tick'),
						assign({
							remainingTime: ({ context }) => context.remainingTime - 1000,
						}),
					],
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
						speedLimit: 5,
						acceleration: 3,
						deceleration: 3,
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
				({ context }) => {
					context.henActorRefs.forEach((henActorRef) => {
						henActorRef.send({ type: 'Pause game' });
					});

					context.eggActorRefs.forEach((eggActorRef) => {
						eggActorRef.send({ type: 'Pause game' });
					});
				},
				// sendParent(({ context }) => {
				// 	return {
				// 		type: 'Level complete',
				// 		generationIndex: context.generationIndex,
				// 		henStatsById: context.henStatsById,
				// 	};
				// }),
			],
		},
	},
});
