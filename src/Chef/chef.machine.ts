import { assign, setup } from 'xstate';
import { animationActor } from '../helpers/animationActor';
import { Position } from '../GameLevel/types';
import Konva from 'konva';

export const chefMachine = setup({
	types: {} as {
		context: {
			chefPotRef: React.RefObject<Konva.Rect>;
			position: Position;
			speed: number;
			speedLimit: number;
			direction: -1 | 0 | 1;
			acceleration: number;
			deceleration: number;
			minXPos: number;
			maxXPos: number;
		};
		events:
			| { type: 'Set chefPotRef'; chefPotRef: React.RefObject<Konva.Rect> }
			| { type: 'Catch' }
			| { type: 'Set direction'; direction: -1 | 0 | 1 };
		input: {
			position: Position;
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
					newSpeed = Math.max(speed * (1 - deceleration), 0);
					if (newSpeed > speedLimit) {
						newSpeed = speedLimit;
					}
				} else if (speed < 0) {
					newSpeed = Math.min(speed * (1 - deceleration), 0);
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
		playCatchAnimation: ({ context }) => {
			context.chefPotRef.current?.to({
				fill: 'yellow',
				duration: 0.1,
				onFinish: () => {
					context.chefPotRef.current?.to({
						fill: 'silver',
						duration: 0.1,
					});
				},
			});
		},
	},
	actors: {
		animationActor,
	},
}).createMachine({
	id: 'chef',
	initial: 'Moving',
	context: ({ input }) => ({
		chefPotRef: { current: null },
		position: input.position,
		speed: input.speed,
		speedLimit: input.speedLimit,
		direction: 0,
		acceleration: input.acceleration,
		deceleration: input.deceleration,
		minXPos: input.minXPos,
		maxXPos: input.maxXPos,
	}),
	on: {
		'Set chefPotRef': {
			actions: assign({
				chefPotRef: ({ event }) => event.chefPotRef,
			}),
		},
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
					actions: 'updateChefPosition',
				},
			},
			on: {
				Catch: {
					actions: 'playCatchAnimation',
				},
			},
		},
	},
});
