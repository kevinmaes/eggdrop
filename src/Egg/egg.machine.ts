import { setup, assign, OutputFrom, sendParent } from 'xstate';
import { animationActor } from '../helpers/animationActor';

export const eggMachine = setup({
	types: {} as {
		context: {
			id: string;
			henId: string;
			position: { x: number; y: number };
			exitPosition: { x: number; y: number };
			fallingSpeed: number;
			exitingSpeed: number;
			floorY: number;
		};
		events: { type: 'Hatch chick' } | { type: 'Splat egg' } | { type: 'Catch' };
		input: {
			id: string;
			henId: string;
			position: { x: number; y: number };
			fallingSpeed: number;
			floorY: number;
		};
	},
	actions: {
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
}).createMachine({
	id: 'egg',
	initial: 'Falling',
	context: ({ input }) => ({
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
				'Hatch chick': 'Hatching',
				'Splat egg': 'Splatting',
				Catch: 'Done',
			},
			invoke: {
				src: 'animationActor',
				onDone: [
					{
						target: 'Falling',
						actions: ['updateEggPosition', 'notifyOfEggPosition'],
						reenter: true,
					},
				],
			},
		},
		Landed: {
			always: [
				{
					guard: () => Math.random() > 0.5,
					target: 'Splatting',
					actions: 'splatOnFloor',
				},
				{ target: 'Hatching', actions: 'hatchOnFloor' },
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
		},
	},
});
