// chefMachine.js
import { createMachine, assign } from 'xstate';

export const chefMachine = createMachine(
	{
		id: 'chef',
		initial: 'idle',
		context: {
			position: { x: window.innerWidth / 2, y: window.innerHeight - 50 },
		},
		states: {
			idle: {
				on: {
					MOVE_LEFT: {
						actions: 'moveLeft',
					},
					MOVE_RIGHT: {
						actions: 'moveRight',
					},
				},
			},
		},
	},
	{
		actions: {
			moveLeft: assign({
				position: ({ context }) => ({
					...context.position,
					x: Math.max(context.position.x - 10, 0),
				}),
			}),
			moveRight: assign({
				position: ({ context }) => ({
					...context.position,
					x: Math.min(context.position.x + 10, window.innerWidth - 50),
				}),
			}),
		},
	}
);
