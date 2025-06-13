// chefMachine.js
import { createMachine, assign } from 'xstate';
import { STAGE_HEIGHT, STAGE_WIDTH } from '../constants';

export const chefMachine = createMachine(
	{
		id: 'chef',
		initial: 'idle',
		context: {
			position: { x: STAGE_WIDTH / 2, y: STAGE_HEIGHT - 50 },
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
					x: Math.min(context.position.x + 10, STAGE_WIDTH - 50),
				}),
			}),
		},
	}
);
