import { assign, fromPromise, raise, setup } from 'xstate';
import Konva from 'konva';
import { Animation } from 'konva/lib/Animation';
import type { GameAssets } from '../types/assets';
import { getGameConfig } from '../GameLevel/gameConfig';
import type { Position, Direction } from '../types';

export const chefMachine = setup({
	types: {} as {
		input: {
			chefConfig: ReturnType<typeof getGameConfig>['chef'];
			chefAssets: GameAssets['chef'];
			position: Position;
			speed: number;
			speedLimit: number;
			acceleration: number;
			deceleration: number;
			minXPos: number;
			maxXPos: number;
		};
		context: {
			chefConfig: ReturnType<typeof getGameConfig>['chef'];
			chefRef: React.RefObject<Konva.Image>;
			chefAssets: GameAssets['chef'];
			position: Position;
			speed: number;
			speedLimit: number;
			direction: Direction['value'];
			movingDirection: Direction['label'];
			lastMovingDirection: Direction['label'];
			acceleration: number;
			deceleration: number;
			minXPos: number;
			maxXPos: number;
			isCatchingEgg: boolean;
		};
		events:
			| { type: 'Set chefRef'; chefRef: React.RefObject<Konva.Image> }
			| { type: 'Catch' }
			| { type: 'Set direction'; direction: Direction['value'] }
			| { type: 'Reset isCatchingEgg' };
	},
	actions: {
		setChefRef: assign({
			chefRef: (_, params: React.RefObject<Konva.Image>) => params,
		}),
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

			// Handle stopping movement
			if (direction === 0) {
				if (speed > 0) {
					newSpeed = speed - deceleration;
					if (newSpeed < 0) {
						newSpeed = 0;
					}
				} else if (speed < 0) {
					newSpeed = speed + deceleration;
					if (newSpeed > 0) {
						newSpeed = 0;
					}
				}
			} else {
				if (direction) {
					newSpeed = speed + direction * acceleration;
				}
			}

			// Restrict the newSpeed to the speedLimit
			if (Math.abs(newSpeed) > speedLimit) {
				newSpeed = Math.sign(newSpeed) * speedLimit;
			}

			newXPos = context.position.x + newSpeed;

			// Constraint the newXPos to the minXPos and maxXPos
			// to be within the boundaries of the chef's movement
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
		setDirectionProps: assign(({ context }, params: Direction['value']) => {
			const direction = params;
			const movingDirection: Direction['label'] =
				direction === 1 ? 'right' : direction === -1 ? 'left' : 'none';

			// When actually moving in a direction (left or right) set the lastMovingDirection
			// to the same value as the movingDirection
			// Otherwise, do not change the value so we can keep track of the last moving direction
			const newLastMovingDirection =
				movingDirection !== 'none'
					? movingDirection
					: context.lastMovingDirection;
			return {
				direction,
				movingDirection,
				lastMovingDirection: newLastMovingDirection,
			};
		}),
		setIsCatchingEgg: assign({
			isCatchingEgg: true,
		}),
		resetIsCatchingEgg: assign({
			isCatchingEgg: false,
		}),
		scheduleResetIsCatchingEgg: raise(
			{ type: 'Reset isCatchingEgg' },
			{
				delay: 300,
			}
		),
	},
	actors: {
		movingChefBackAndForthActor: fromPromise<{ timeDiff: number }>(() => {
			let anim: Animation | null;
			return new Promise((resolve) => {
				anim = new Animation((frame) => {
					if (frame?.timeDiff) {
						resolve({ timeDiff: frame?.timeDiff });
						anim?.stop();
						anim = null;
					}
				});
				anim.start();
			});
		}),
	},
}).createMachine({
	id: 'Chef',
	initial: 'Moving',
	context: ({ input }) => ({
		chefConfig: input.chefConfig,
		chefRef: { current: null },
		chefAssets: input.chefAssets,
		position: input.position,
		speed: input.speed,
		speedLimit: input.speedLimit,
		direction: 0,
		movingDirection: 'none',
		lastMovingDirection: 'none',
		acceleration: input.acceleration,
		deceleration: input.deceleration,
		minXPos: input.minXPos,
		maxXPos: input.maxXPos,
		isCatchingEgg: false,
	}),
	on: {
		'Set chefRef': {
			actions: { type: 'setChefRef', params: ({ event }) => event.chefRef },
		},
		'Set direction': {
			actions: {
				type: 'setDirectionProps',
				params: ({ event }) => event.direction,
			},
		},
	},
	states: {
		Moving: {
			invoke: {
				src: 'movingChefBackAndForthActor',
				onDone: {
					target: 'Moving',
					reenter: true,
					actions: 'updateChefPosition',
				},
			},
			on: {
				Catch: {
					actions: ['setIsCatchingEgg', 'scheduleResetIsCatchingEgg'],
				},
				'Reset isCatchingEgg': {
					actions: 'resetIsCatchingEgg',
				},
			},
		},
	},
});
