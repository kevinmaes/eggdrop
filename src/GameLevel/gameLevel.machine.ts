import { createActorContext } from '@xstate/react';
import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { assign, log, raise, sendTo, setup } from 'xstate';
import { chefMachine } from '../Chef/chef.machine';

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

const gameLevelMachine = setup({
	types: {} as {
		context: {
			stageDimensions: { width: number; height: number };
			chefDimensions: { width: number; height: number };
			generationIndex: number;
			hens: HenConfig[];
			eggs: EggConfig[];
			chefPotRimHitRef: React.RefObject<Rect> | null;
		};
		events:
			| { type: 'Play' }
			| {
					type: 'Set chefPotRimHitRef';
					chefPotRimHitRef: React.RefObject<Rect>;
			  }
			| {
					type: 'Egg laid';
					henId: string;
					position: { x: number; y: number };
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
	},
}).createMachine({
	context: {
		stageDimensions: { width: 1920, height: 1080 },
		chefDimensions: { width: 124, height: 150 },
		generationIndex: 0,
		hens: [],
		eggs: [],
		chefPotRimHitRef: null,
	},
	initial: 'Playing',
	on: {
		'Set chefPotRimHitRef': {
			actions: assign({
				chefPotRimHitRef: ({ event }) => event.chefPotRimHitRef,
			}),
		},
		'Egg laid': {
			actions: [
				log('Egg laid'),
				assign({
					eggs: ({ context, event }) => [
						...context.eggs,
						{
							id: nanoid(),
							henId: event.henId,
							initialX: event.position.x,
							initialY: event.position.y,
						},
					],
				}),
			],
		},
		'Egg position updated': [
			{
				guard: 'testPotRimHit',
				actions: [
					raise(({ event }) => ({
						type: 'Remove egg',
						eggId: event.eggId,
					})),
					sendTo('chefMachine', { type: 'Catch' }),
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
				({ context }) => {
					console.log('eggs: ', context.eggs.length);
				},
			],
		},
	},
	states: {
		Playing: {
			entry: log('now Playing'),
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

export const GameLevelActorContext = createActorContext(gameLevelMachine);

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
