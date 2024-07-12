import { setup, assign, sendParent } from 'xstate';

export const eggMachine = setup({
	types: {} as {
		context: {
			id: string;
			henId: string;
			position: { x: number; y: number };
			targetPosition: { x: number; y: number };
			fallingSpeed: number;
			exitingSpeed: number;
			floorY: number;
		};
		events:
			| { type: 'Land on floor'; result: 'Hatch' | 'Splat' }
			| { type: 'Catch' }
			| { type: 'Finished exiting' };
		input: {
			id: string;
			henId: string;
			position: { x: number; y: number };
			fallingSpeed: number;
			floorY: number;
		};
	},
	actions: {
		setNewTargetPosition: assign({
			targetPosition: ({ context }) => ({
				x: context.position.x,
				y: context.floorY - 30,
			}),
		}),
		setTargetPositionToExit: assign({
			targetPosition: ({ context }) => ({
				x: Math.random() > 0.5 ? window.innerWidth + 50 : -50,
				y: context.floorY - 60,
			}),
		}),
		splatOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x - 20,
				y: context.floorY - 50,
			}),
		}),
		hatchOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x,
				y: context.floorY - 60,
			}),
		}),
	},
}).createMachine({
	id: 'egg',
	initial: 'Falling',
	context: ({ input }) => ({
		id: input.id,
		henId: input.henId,
		position: input.position,
		targetPosition: input.position,
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
			entry: 'setNewTargetPosition',
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
			entry: ['setTargetPositionToExit'],
			on: {
				'Finished exiting': 'Done',
			},
		},
		Done: {
			type: 'final',
			entry: [
				sendParent(({ context }) => ({
					type: 'Remove egg',
					eggId: context.id,
				})),
			],
		},
	},
});
