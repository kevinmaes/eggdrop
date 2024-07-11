import { assign, log, setup } from 'xstate';
import { EggHitTestResult } from './Chef';
import { animationActor } from '../helpers/animationActor';

export const chefMachine = setup({
	types: {} as {
		context: {
			position: { x: number; y: number };
			speed: number;
			speedLimit: number;
			direction: -1 | 0 | 1;
			acceleration: number;
			deceleration: number;
			hitTestResult: EggHitTestResult;
			minXPos: number;
			maxXPos: number;
		};
		events:
			| { type: 'Catch' }
			| { type: 'Broke'; hitTestResult: EggHitTestResult }
			| { type: 'Set direction'; direction: -1 | 0 | 1 };
		input: {
			position: { x: number; y: number };
			speed: number;
			speedLimit: number;
			acceleration: number;
			deceleration: number;
			minXPos: number;
			maxXPos: number;
		};
	},
	actions: {
		// Stub for a provided action
		updateChefPosition: assign(({ context }) => {
			const {
				speed,
				speedLimit,
				position,
				direction,
				acceleration,
				deceleration,
				minXPos,
				maxXPos,
			} = context;
			let newSpeed = speed;
			let newXPos = position.x;

			if (direction === 0) {
				if (speed > 0) {
					newSpeed = Math.max(speed - deceleration, 0);
					if (newSpeed > speedLimit) {
						newSpeed = speedLimit;
					}
				} else if (speed < 0) {
					newSpeed = Math.min(speed + deceleration, 0);
					if (Math.abs(newSpeed) > speedLimit) {
						newSpeed = -speedLimit;
					}
				}
			} else {
				if (direction) {
					newSpeed = speed + direction * acceleration;
				}
			}

			newXPos = context.position.x + newSpeed;

			if (newXPos < minXPos) {
				newXPos = minXPos;
				newSpeed = 0;
			} else if (newXPos > maxXPos) {
				newXPos = maxXPos;
				newSpeed = 0;
			}

			return {
				speed: newSpeed,
				position: { x: newXPos, y: position.y },
			};
		}),
	},
	actors: {
		animationActor,
	},
}).createMachine({
	id: 'chef',
	initial: 'Moving',
	context: ({ input }) => ({
		position: input.position,
		speed: input.speed,
		speedLimit: input.speedLimit,
		direction: 0,
		acceleration: input.acceleration,
		deceleration: input.deceleration,
		hitTestResult: 'none',
		minXPos: input.minXPos,
		maxXPos: input.maxXPos,
	}),
	on: {
		'Set direction': {
			actions: assign({
				direction: ({ event }) => ('direction' in event ? event.direction : 0),
			}),
		},
	},
	states: {
		Moving: {
			invoke: {
				src: 'animationActor',
				onDone: {
					target: 'Moving',
					reenter: true,
					actions: ['updateChefPosition'],
				},
			},
			on: {
				Catch: {
					target: 'Catching',
					actions: [
						log('Catch received by chef'),
						assign({
							direction: 0,
							speed: 0,
						}),
					],
				},
				Broke: {
					target: 'Broken',
					actions: assign({
						hitTestResult: ({ event }) => event.hitTestResult,
					}),
				},
			},
		},
		Catching: {
			after: {
				200: 'Moving',
			},
		},
		Broken: {
			after: {
				200: 'Moving',
			},
			exit: assign({
				hitTestResult: 'none',
			}),
		},
	},
});
