import { createActorContext } from '@xstate/react';
import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';
import { getStartXPosition, henMachine } from '../Hen/hen.machine';
import { eggMachine } from '../Egg/egg.machine';
import { CHEF_DIMENSIONS, STAGE_DIMENSIONS } from './gameConfig';
import { STAGE_WIDTH } from '../constants';

const henConfigs = new Array(1).fill(null).map(() => ({
	id: nanoid(),
	initialX: getStartXPosition(STAGE_WIDTH),
	initialY: 20,
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
	},
	initial: 'Playing',
	on: {
		'Set chefPotRimHitRef': {
			actions: assign({
				chefPotRimHitRef: ({ event }) => event.chefPotRimHitRef,
			}),
		},
		'Lay an egg': {
			actions: assign({
				eggActorRefs: ({ context, event, spawn }) => {
					const eggHenButtYOffset = 35;
					const eggId = nanoid();
					// Spawn and add a new egg.
					return [
						...context.eggActorRefs,
						spawn(eggMachine, {
							systemId: eggId,
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
		'Remove egg': {
			actions: [
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
			entry: [
				assign({
					henActorRefs: ({ context, spawn }) => {
						return henConfigs.map(({ id: henId, initialX, initialY }) =>
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
						);
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
