import { createActorContext } from '@xstate/react';
import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';
import { getStartXPosition, henMachine } from '../Hen/hen.machine';
import { eggMachine, EggResultStatus } from '../Egg/egg.machine';
import { CHEF_DIMENSIONS, STAGE_DIMENSIONS } from './gameConfig';

interface HenStats {
	id: string;
	eggsLayed: number;
	eggsCaught: number;
	eggsHatched: number;
	eggsBroken: number;
}

interface GenerationStats {
	generationIndex: number;
	averageEggsLayed: number;
	averageEggsHatched: number;
	averageEggsSplat: number;
	averageEggsBroken: number;
	averageHenSpeedLimit: number;
	// other averages here
}

export interface GenerationSnapshot {
	stats: GenerationStats;
	henStatsById: Record<string, HenStats>;
}

const henConfigs = new Array(1).fill(null).map(() => ({
	id: nanoid(),
	initialX: getStartXPosition(1920),
	initialY: 10,
}));

const gameLevelMachine = setup({
	types: {} as {
		context: {
			stageDimensions: { width: number; height: number };
			chefDimensions: { width: number; height: number };
			generationIndex: number;
			henActorRefs: ActorRefFrom<typeof henMachine>[];
			eggActorRefs: ActorRefFrom<typeof eggMachine>[];
			chefPotRimHitRef: React.RefObject<Rect> | null;
			henStatsById: Record<string, HenStats>;
		};
		events:
			| { type: 'Play' }
			| {
					type: 'Set chefPotRimHitRef';
					chefPotRimHitRef: React.RefObject<Rect>;
			  }
			| {
					type: 'Lay an egg';
					henId: string;
					henPosition: { x: number; y: number };
			  }
			| {
					type: 'Egg position updated';
					eggId: string;
					position: { x: number; y: number };
			  }
			| {
					type: 'Egg done';
					henId: string;
					eggId: string;
					resultStatus: EggResultStatus;
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
				params: { henId: string; henPosition: { x: number; y: number } }
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
		updateHenStatsForEggLayed: assign({
			henStatsById: ({ context }, params: { henId: string }) => {
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
				return updatedHenStatsById;
			},
		}),
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
	context: {
		stageDimensions: STAGE_DIMENSIONS,
		chefDimensions: CHEF_DIMENSIONS,
		generationIndex: 0,
		henActorRefs: [],
		eggActorRefs: [],
		chefPotRimHitRef: null,
		henStatsById: {},
	},
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
			invoke: {
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
		},
	},
});

export const GameLevelActorContext = createActorContext(gameLevelMachine, {
	systemId: 'gameLevelMachine',
});
