// eggMachine.js
import { setup, assign, fromPromise } from 'xstate';

export const eggMachine = setup({
	actors: {
		fallEgg: fromPromise(() => {
			return new Promise<void>((resolve) => {
				const interval = setInterval(() => {
					resolve();
					clearInterval(interval);
				}, 1000);
			});
		}),
	},
	actions: {
		updatePosition: assign({
			position: ({ context, event }) => ({
				x: context.position.x,
				y: context.position.y + context.speed * event.timeDiff * 0.1,
			}),
		}),
	},
	guards: {
		hitFloor: ({ context }) => context.position.y >= window.innerHeight - 50,
		caughtByChef: ({ context, event }) => {
			const chefX = event.chefPosition.x;
			const chefY = event.chefPosition.y;
			return (
				context.position.x >= chefX &&
				context.position.x <= chefX + 50 &&
				context.position.y >= chefY &&
				context.position.y <= chefY + 50
			);
		},
	},
}).createMachine({
	id: 'egg',
	initial: 'falling',
	context: {
		position: { x: 0, y: 0 },
		speed: 2, // speed of falling
	},
	states: {
		falling: {
			invoke: {
				src: 'fallEgg',
				onDone: [
					{ target: 'splatted', guard: 'hitFloor' },
					{ target: 'caught', guard: 'caughtByChef' },
				],
				actions: 'updatePosition',
			},
		},
		splatted: {
			type: 'final',
		},
		caught: {
			type: 'final',
		},
	},
});
