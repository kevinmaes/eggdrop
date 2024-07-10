import { createActorContext } from '@xstate/react';
import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, log, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';
import { getStartXPosition, henMachine } from '../Hen/hen.machine';
import { eggMachine } from '../Egg/egg.machine';

interface EggConfig {
	id: string;
	henId: string;
	initialX: number;
	initialY: number;
}

interface HenConfig {
	id: string;
	initialX: number;
	initialY: number;
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
			hens: HenConfig[];
			eggs: EggConfig[];
			henActorRefs: ActorRefFrom<typeof henMachine>[];
			eggActorRefs: ActorRefFrom<typeof eggMachine>[];

			chefPotRimHitRef: React.RefObject<Rect> | null;
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
			| { type: 'Remove egg'; eggId: string };
	},
	actors: {
		chefMachine,
		henMachine,
		eggMachine,
	},
	guards: {
		testPotRimHit: ({ context, event }) => {
			// console.log('testPotRimHit');
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
		stageDimensions: { width: 1920, height: 1080 },
		chefDimensions: { width: 124, height: 150 },
		generationIndex: 0,
		hens: [],
		eggs: [],
		henActorRefs: [],
		eggActorRefs: [],
		chefPotRimHitRef: null,
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
				log('Lay an egg'),
				assign({
					eggActorRefs: ({ context, event, spawn }) => {
						const eggHenButtYOffset = 35;
						const eggId = nanoid();
						return [
							...context.eggActorRefs,
							spawn('eggMachine', {
								id: eggId,
								systemId: eggId,
								onDone: { actions: 'Remove egg' },
								input: {
									id: eggId,
									henId: event.henId,
									position: {
										x: event.henPosition.x,
										y: event.henPosition.y + eggHenButtYOffset,
									},
									fallingSpeed: 2,
									floorY: context.stageDimensions.height,
								},
							}),
						];
					},
				}),
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
			{
				guard: 'egg hits the floor',
				actions: [
					// log('egg hit the floor'),
					sendTo(
						({ system, event }) => system.get(event.eggId),
						() => {
							return {
								type: Math.random() < 0.5 ? 'Hatch chick' : 'Splat egg',
							};
						}
					),
				],
			},
		],
		'Remove egg': {
			actions: [
				log('Remove egg'),
				assign({
					eggs: ({ context, event }) =>
						context.eggs.filter((egg) => egg.id !== event.eggId),
				}),
				({ context, event }) => {
					console.log('After remove eggs: ', context.eggs.length, event);
				},
			],
		},
	},
	states: {
		Playing: {
			entry: [
				log('now Playing'),
				assign({
					henActorRefs: ({ context, spawn }) => {
						return henConfigs.map((config) => {
							const { id: henId, initialX, initialY } = config;
							const spawnedHen = spawn('henMachine', {
								id: henId,
								systemId: henId,
								input: {
									id: henId,
									position: {
										x: initialX,
										y: initialY,
									},
									stageDimensions: context.stageDimensions,
									maxEggs: -1,
									stationaryEggLayingRate: 0.9,
									movingEggLayingRate: 0.1,
								},
							});
							return spawnedHen;
						});
					},
				}),
			],
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
					speedLimit: 20,
					acceleration: 0.1 * 20,
					deceleration: 1,
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

// assign({
// 	eggs: ({ context, event, system }) => {
// 		if (!context.chefPotRimHitRef?.current) {
// 			return context.eggs;
// 		}

// 		const { position, eggId } = event;
// 		// if (!chefPotLeftHitRef.current) {
// 		// 	return;
// 		// }
// 		// if (!chefPotRightHitRef.current) {
// 		// 	return;
// 		// }

// 		// Pot rim hit box
// 		const {
// 			x: potRimHitX,
// 			y: potRimHitY,
// 			width: potRimHitWidth,
// 			height: potRimHitHeight,
// 		} = context.chefPotRimHitRef.current?.getClientRect();

// 		if (position.y < potRimHitY) {
// 			return context.eggs;
// 		}

// 		if (
// 			position.x >= potRimHitX &&
// 			position.x <= potRimHitX + potRimHitWidth &&
// 			position.y >= potRimHitY &&
// 			position.y <= potRimHitY + potRimHitHeight
// 		) {
// 			console.log(`Egg ${eggId} caught by the chef!`);

// 			system.get('chefMachine').send({
// 				type: 'Catch',
// 			});

// 			return context.eggs.filter((egg) => egg.id !== eggId);
// 		}

// 		// Check for hits to the side of the pot
// 		// const {
// 		// 	x: potLeftHitX,
// 		// 	y: potLeftHitY,
// 		// 	width: potLeftHitWidth,
// 		// 	height: potLeftHitHeight,
// 		// } = chefPotLeftHitRef.current?.getClientRect();

// 		// const {
// 		// 	x: potRightHitX,
// 		// 	y: potRightHitY,
// 		// 	width: potRightHitWidth,
// 		// 	height: potRightHitHeight,
// 		// } = chefPotRightHitRef.current?.getClientRect();

// 		// if (
// 		// 	position.x >= potLeftHitX &&
// 		// 	position.x <= potLeftHitX + potLeftHitWidth &&
// 		// 	position.y >= potLeftHitY &&
// 		// 	position.y <= potLeftHitY + potLeftHitHeight
// 		// ) {
// 		// 	console.log(`Egg ${id} hit the left side of the pot!`);
// 		// 	setHitTestResult('broke-left');
// 		// 	setTimeout(() => {
// 		// 		setHitTestResult('none');
// 		// 	}, 1);
// 		// }

// 		// if (
// 		// 	position.x >= potRightHitX &&
// 		// 	position.x <= potRightHitX + potRightHitWidth &&
// 		// 	position.y >= potRightHitY &&
// 		// 	position.y <= potRightHitY + potRightHitHeight
// 		// ) {
// 		// 	console.log(`Egg ${id} hit the right side of the pot!`);
// 		// 	setHitTestResult('broke-right');
// 		// 	setTimeout(() => {
// 		// 		setHitTestResult('none');
// 		// 	}, 1);
// 		// }
// 		return context.eggs;
// 	},
// }),
