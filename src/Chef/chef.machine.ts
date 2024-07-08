// chefMachine.js
import { setup } from 'xstate';

export const chefMachine = setup({
	types: {} as {
		context: {
			position: { x: number; y: number };
			speed: number;
			direction: -1 | 0 | 1;
			acceleration: number;
			deceleration: number;
		};
		events: { type: 'Move left' } | { type: 'Move right' };
	},
	actions: {
		// move: assign(({ context, event }) => {
		// 	// const { speed, acceleration, deceleration, position } = context;
		// 	// let newSpeed = speed;
		// 	// let direction = 0;
		// 	// if (event.type === 'Move left') {
		// 	// 	direction = -1;
		// 	// } else if (event.type === 'Move right') {
		// 	// 	direction = 1;
		// 	// }
		// 	// console.log('direction', direction);
		// 	// if (direction === 0) {
		// 	// 	if (speed > 0) {
		// 	// 		newSpeed = Math.max(speed - deceleration, 0);
		// 	// 	} else if (speed < 0) {
		// 	// 		newSpeed = Math.min(speed + deceleration, 0);
		// 	// 	}
		// 	// } else {
		// 	// 	if (direction) {
		// 	// 		newSpeed = speed + direction * acceleration;
		// 	// 	}
		// 	// }
		// 	// return {
		// 	// 	position: {
		// 	// 		...position,
		// 	// 		x: position.x + newSpeed,
		// 	// 	},
		// 	// 	speed: newSpeed,
		// 	// };
		// }),
		// moveRight: assign({
		// 	position: ({ context }) => ({
		// 		...context.position,
		// 		x: Math.min(context.position.x + 10, window.innerWidth - 50),
		// 	}),
		// }),
	},
}).createMachine({
	id: 'chef',
	initial: 'Idle',
	context: {
		position: { x: window.innerWidth / 2, y: window.innerHeight - 120 },
		speed: 0,
		direction: 0,
		acceleration: 0.3,
		deceleration: 0.5,
	},
	states: {
		Idle: {
			on: {
				'Move left': {
					// actions: 'move',
				},
				'Move right': {
					// actions: 'move',
				},
			},
		},
	},
});
