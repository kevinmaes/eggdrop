import { assign, fromPromise, setup } from 'xstate';

export function getStartXPosition(stageWidth: number, buffer: number = 50) {
	return Math.random() > 0.5 ? -buffer : stageWidth + buffer;
}

export function pickXPosition(stageWidth: number, buffer: number = 50) {
	return Math.random() * (stageWidth - 2 * buffer) + buffer;
}

export const henMachine = setup({
	types: {} as {
		input: {
			position: { x: number; y: number };
			stageWidth: number;
			maxEggs: number;
			eggLayingRate: number;
		};
		context: {
			stageWidth: number;
			position: { x: number; y: number };
			targetPosition: { x: number; y: number };
			speed: number;
			minStopMS: number;
			maxStopMS: number;
			maxEggs: number;
			eggsLaid: number;
			eggLayingRate: number;
		};
	},
	actors: {
		// Stub for a provided actor
		moveHen: fromPromise(() => Promise.resolve({ timeDiff: 0 })),
	},
	guards: {
		'can lay egg': ({ context }) => {
			const allowedByMax =
				context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs;
			return allowedByMax && Math.random() < context.eggLayingRate;
		},
		// 'can lay egg': ({ context }) =>
		// 	context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs,
	},
	actions: {
		pickNewTargetXPosition: assign(({ context }) => ({
			targetPosition: { x: pickXPosition(context.stageWidth), y: 0 },
		})),
		updatePosition: assign(({ context, event }) => {
			// Compare the context.position.x with context.targetPosition.x
			// and calulate the direction
			let direction = 1;
			if (context.position.x > context.targetPosition.x) {
				direction = -1;
			}

			let newX =
				context.position.x + direction * event.output.timeDiff * context.speed;

			if (direction === 1 && newX > context.targetPosition.x) {
				newX = context.targetPosition.x;
			}
			if (direction === -1 && newX < context.targetPosition.x) {
				newX = context.targetPosition.x;
			}

			return {
				position: { x: newX, y: context.position.y },
			};
		}),
		// Stub for a provided action
		layEgg: () => {
			// Trigger the creation of a new egg
		},
	},
	delays: {
		pickStopDuration: ({ context }) => {
			const { minStopMS, maxStopMS } = context;
			return Math.random() * (maxStopMS - minStopMS) + minStopMS;
		},
	},
}).createMachine({
	id: 'hen',
	initial: 'Setting Target Position',
	context: ({ input }) => ({
		stageWidth: input.stageWidth,
		position: input.position,
		targetPosition: { x: 0, y: 0 },
		speed: 0.4,
		minStopMS: 500,
		// maxStopMS: 5000,
		maxStopMS: 500,
		maxEggs: input.maxEggs,
		eggsLaid: 0,
		eggLayingRate: input.eggLayingRate,
	}),
	on: {
		'Set stage width': {
			actions: assign({
				stageWidth: ({ event }) => event.stageWidth,
			}),
		},
	},
	states: {
		'Setting Target Position': {
			entry: 'pickNewTargetXPosition',
			always: { target: 'Moving' },
		},
		Moving: {
			invoke: {
				src: 'moveHen',
				onDone: [
					{
						guard: ({ context }) =>
							context.position.x === context.targetPosition.x,
						target: 'Stopped',
					},
					{
						target: 'Moving',
						reenter: true,
						actions: 'updatePosition',
					},
				],
			},
		},
		Stopped: {
			entry: ['pickNewTargetXPosition'],
			after: {
				pickStopDuration: [
					{ guard: 'can lay egg', target: 'Laying Egg' },
					{ target: 'Moving' },
				],
			},
		},
		'Laying Egg': {
			entry: [
				'layEgg',
				assign({
					eggsLaid: ({ context }) => context.eggsLaid + 1,
				}),
			],
			after: { 1000: 'Moving' },
		},
	},
});
