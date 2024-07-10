import { createActorContext } from '@xstate/react';
import { Rect } from 'konva/lib/shapes/Rect';
import { nanoid } from 'nanoid';
import { ActorRefFrom, assign, log, setup } from 'xstate';
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
			generationIndex: number;
			hens: HenConfig[];
			eggs: EggConfig[];
			chefActorRef: ActorRefFrom<typeof chefMachine> | null;
			chefPotRimHitRef: React.RefObject<Rect> | null;
		};
		events:
			| {
					type: 'Set chefActorRef';
					chefActorRef: ActorRefFrom<typeof chefMachine>;
			  }
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
}).createMachine({
	context: {
		generationIndex: 0,
		hens: [],
		eggs: [],
		chefActorRef: null,
		chefPotRimHitRef: null,
	},
	initial: 'Idle',
	on: {
		'Set chefActorRef': {
			actions: [
				log('Setting chefActorRef'),
				assign({
					chefActorRef: ({ context, event }) => {
						// if (context.chefActorRef === null) {
						return event.chefActorRef;
						// }
						// return context.chefActorRef;
					},
				}),
			],
		},
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
		'Egg position updated': {
			actions: [
				// log('Egg position updated'),
				assign({
					eggs: ({ context, event }) => {
						if (!context.chefPotRimHitRef?.current) {
							return context.eggs;
						}

						const { position, eggId } = event;
						// if (!chefPotLeftHitRef.current) {
						// 	return;
						// }
						// if (!chefPotRightHitRef.current) {
						// 	return;
						// }

						// Pot rim hit box
						const {
							x: potRimHitX,
							y: potRimHitY,
							width: potRimHitWidth,
							height: potRimHitHeight,
						} = context.chefPotRimHitRef.current?.getClientRect();

						if (position.y < potRimHitY) {
							return context.eggs;
						}

						if (
							position.x >= potRimHitX &&
							position.x <= potRimHitX + potRimHitWidth &&
							position.y >= potRimHitY &&
							position.y <= potRimHitY + potRimHitHeight
						) {
							console.log(`Egg ${eggId} caught by the chef!`);

							context.chefActorRef?.send({
								type: 'Catch',
							});

							return context.eggs.filter((egg) => egg.id !== eggId);
						}

						// Check for hits to the side of the pot
						// const {
						// 	x: potLeftHitX,
						// 	y: potLeftHitY,
						// 	width: potLeftHitWidth,
						// 	height: potLeftHitHeight,
						// } = chefPotLeftHitRef.current?.getClientRect();

						// const {
						// 	x: potRightHitX,
						// 	y: potRightHitY,
						// 	width: potRightHitWidth,
						// 	height: potRightHitHeight,
						// } = chefPotRightHitRef.current?.getClientRect();

						// if (
						// 	position.x >= potLeftHitX &&
						// 	position.x <= potLeftHitX + potLeftHitWidth &&
						// 	position.y >= potLeftHitY &&
						// 	position.y <= potLeftHitY + potLeftHitHeight
						// ) {
						// 	console.log(`Egg ${id} hit the left side of the pot!`);
						// 	setHitTestResult('broke-left');
						// 	setTimeout(() => {
						// 		setHitTestResult('none');
						// 	}, 1);
						// }

						// if (
						// 	position.x >= potRightHitX &&
						// 	position.x <= potRightHitX + potRightHitWidth &&
						// 	position.y >= potRightHitY &&
						// 	position.y <= potRightHitY + potRightHitHeight
						// ) {
						// 	console.log(`Egg ${id} hit the right side of the pot!`);
						// 	setHitTestResult('broke-right');
						// 	setTimeout(() => {
						// 		setHitTestResult('none');
						// 	}, 1);
						// }
						return context.eggs;
					},
				}),
			],
		},
		'Remove egg': {
			actions: [
				log('Remove egg'),
				assign({
					eggs: ({ context, event }) =>
						context.eggs.filter((egg) => egg.id !== event.eggId),
				}),
			],
		},
	},
	states: {
		Idle: {},
	},
});

export const GameLevelActorContext = createActorContext(gameLevelMachine);
