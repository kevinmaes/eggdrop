import { createMachine, assign } from 'xstate';
import { STAGE_HEIGHT } from '../constants';

export const henMachine = createMachine(
	{
		id: 'hen',
		initial: 'moving',
		context: {
			position: { x: 0, y: 0.5 * STAGE_HEIGHT },
			direction: 1, // 1 for right, -1 for left
			speed: 0.4,
		},
		states: {
			moving: {
				invoke: {
					src: 'moveHen',
					onDone: {
						target: 'moving',
						reenter: true,
						actions: 'updatePosition',
					},
				},
				after: {
					2000: { target: 'layingEgg' },
				},
			},
			layingEgg: {
				entry: 'layEgg',
				always: { target: 'moving' },
			},
		},
	},
	{
		actions: {
			updatePosition: assign(({ context, event }) => {
				let newX =
					context.position.x +
					context.direction * event.output.timeDiff * context.speed;
				let newDirection = context.direction;

				if (newX > 1000 - 50 || newX < 0) {
					newDirection = -context.direction;
				}

				return {
					position: { x: newX, y: context.position.y },
					direction: newDirection,
				};
			}),
			layEgg: () => {
				// Trigger the creation of a new egg
			},
		},
	}
);
