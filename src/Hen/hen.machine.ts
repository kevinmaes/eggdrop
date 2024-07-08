import { assign, fromPromise, log, setup } from 'xstate';

export function pickXPosition({
	context,
}: {
	context: { stageWidth: number };
}) {
	const xBuffer = 50;
	return Math.random() * (context.stageWidth - 2 * xBuffer) + xBuffer;
}

export const henMachine = setup({
	types: {} as {
		input: {
			position: { x: number; y: number };
			stageWidth: number;
		};
		context: {
			stageWidth: number;
			position: { x: number; y: number };
			targetPosition: { x: number; y: number };
			speed: number;
			minStopMS: number;
			maxStopMS: number;
		};
	},
	actors: {
		// Stub for a provided actor
		moveHen: fromPromise(() => Promise.resolve({ timeDiff: 0 })),
	},
	guards: {
		'can lay egg': () => Math.random() < 0.1,
	},
	actions: {
		pickNewTargetXPosition: assign(({ context }) => ({
			targetPosition: { x: pickXPosition({ context }), y: 0 },
		})),
		// Stub for provided actions
		updatePosition: () => {},
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
		maxStopMS: 5000,
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
			always: { target: 'moving' },
		},
		moving: {
			invoke: {
				src: 'moveHen',
				onDone: [
					{
						guard: ({ context }) =>
							context.position.x === context.targetPosition.x,
						target: 'stopped',
					},
					{
						target: 'moving',
						reenter: true,
						actions: 'updatePosition',
					},
				],
			},
		},
		stopped: {
			entry: ['pickNewTargetXPosition'],
			after: {
				pickStopDuration: [
					{ guard: 'can lay egg', target: 'layingEgg' },
					{ target: 'moving' },
				],
			},
		},
		layingEgg: {
			entry: 'layEgg',
			after: { 1000: 'moving' },
		},
	},
});
