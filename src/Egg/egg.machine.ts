import { setup, assign, OutputFrom, sendParent } from 'xstate';
import { animationActor } from '../helpers/animationActor';
import { CHEF_DIMENSIONS, STAGE_DIMENSIONS } from '../GameLevel/gameConfig';
import { Ref } from 'react';
import Konva from 'konva';

export const eggMachine = setup({
	types: {} as {
		context: {
			eggRef: Ref<Konva.Circle>;
			id: string;
			henId: string;
			position: { x: number; y: number };
			exitPosition: { x: number; y: number };
			fallingSpeed: number;
			exitingSpeed: number;
			floorY: number;
		};
		events:
			| { type: 'Land on floor'; result: 'Hatch' | 'Splat' }
			| { type: 'Catch' };
		input: {
			id: string;
			henId: string;
			position: { x: number; y: number };
			fallingSpeed: number;
			floorY: number;
		};
	},
	actions: {
		setEggRef: assign({
			eggRef: (_, params: { eggRef: Ref<Konva.Circle> }) => params.eggRef,
		}),
		// Stub for a provided action
		notifyOfEggPosition: sendParent(({ context }) => ({
			type: 'Egg position updated',
			eggId: context.id,
			position: context.position,
		})),
		splatOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x - 20,
				y: context.floorY - 10,
			}),
		}),
		hatchOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x,
				y: context.floorY - 30,
			}),
		}),
		updateEggPosition: assign({
			position: ({ context, event }) => {
				if (!('output' in event)) return context.position;
				const output = event.output as OutputFrom<typeof animationActor>;
				const newY =
					context.position.y + context.fallingSpeed * output.timeDiff * 0.1;
				const newPosition = {
					x: context.position.x,
					y: newY,
				};

				return newPosition;
			},
		}),
		updateChickPosition: assign({
			position: ({ context, event }) => {
				if (!('output' in event)) return context.position;
				const output = event.output as OutputFrom<typeof animationActor>;
				const direction = context.exitPosition.x < 0 ? -1 : 1;
				const newX =
					context.position.x +
					direction * context.exitingSpeed * output.timeDiff * 0.1;
				return {
					x: newX,
					y: context.position.y,
				};
			},
		}),
	},
	actors: {
		animationActor,
	},
	guards: {
		'egg is in chef range': ({ context }) => {
			return (
				context.position.y >= STAGE_DIMENSIONS.height - CHEF_DIMENSIONS.height
			);
		},
	},
}).createMachine({
	id: 'egg',
	initial: 'Falling',
	context: ({ input }) => ({
		eggRef: null,
		id: input.id,
		henId: input.henId,
		position: input.position,
		fallingSpeed: input.fallingSpeed,
		exitingSpeed: 10,
		exitPosition: {
			x: Math.random() > 0.5 ? window.innerWidth + 50 : -50,
			y: input.floorY - 50,
		},
		floorY: input.floorY,
	}),
	states: {
		Falling: {
			on: {
				'Land on floor': 'Landed',
				Catch: 'Done',
			},
		},
		Landed: {
			always: [
				{
					guard: ({ event }) => {
						if (event.type !== 'Land on floor') return false;
						return event.result === 'Splat';
					},
					target: 'Splatting',
					actions: 'splatOnFloor',
				},
				{
					target: 'Hatching',
					actions: 'hatchOnFloor',
				},
			],
		},
		Hatching: {
			entry: assign({
				position: ({ context }) => ({
					x: context.position.x,
					y: context.position.y - 20,
				}),
			}),
			after: {
				1000: 'Exiting',
			},
		},
		Splatting: {
			after: {
				1000: 'Done',
			},
		},
		Exiting: {
			invoke: {
				src: 'animationActor',
				onDone: [
					{
						target: 'Done',
						actions: 'updateChickPosition',
						guard: ({ context }) =>
							context.position.x === context.exitPosition.x,
					},
					{
						target: 'Exiting',
						actions: 'updateChickPosition',
						reenter: true,
					},
				],
			},
		},
		Done: {
			type: 'final',
			entry: sendParent(({ context }) => ({
				type: 'Remove egg',
				eggId: context.id,
			})),
		},
	},
});
