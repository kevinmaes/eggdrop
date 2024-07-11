import { assign, sendParent, setup } from 'xstate';
import { animationActor } from '../helpers/animationActor';

export function getStartXPosition(stageWidth: number, buffer: number = 50) {
	return Math.random() > 0.5 ? -buffer : stageWidth + buffer;
}

export function pickXPosition(stageWidth: number, buffer: number = 50) {
	return Math.random() * (stageWidth - 2 * buffer) + buffer;
}

export const henMachine = setup({
	types: {} as {
		input: {
			id: string;
			position: { x: number; y: number };
			stageDimensions: { width: number; height: number };
			maxEggs: number;
			stationaryEggLayingRate: number;
			movingEggLayingRate: number;
		};
		context: {
			id: string;
			stageDimensions: { width: number; height: number };
			position: { x: number; y: number };
			targetPosition: { x: number; y: number };
			speed: number;
			minStopMS: number;
			maxStopMS: number;
			maxEggs: number;
			eggsLaid: number;
			stationaryEggLayingRate: number;
			movingEggLayingRate: number;
		};
	},
	actors: {
		animationActor,
	},
	guards: {
		'can lay egg while stopped': ({ context }) => {
			const withinLimit =
				context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs;
			const withinEggLayingRate =
				Math.random() < context.stationaryEggLayingRate;
			return withinLimit && withinEggLayingRate;
		},
		'can lay egg while moving': ({ context }) => {
			const withinLimit =
				context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs;
			const withinEggLayingRate = Math.random() < context.movingEggLayingRate;
			return withinLimit && withinEggLayingRate;
		},
	},
	actions: {
		pickNewTargetXPosition: assign(({ context }) => ({
			targetPosition: { x: pickXPosition(context.stageDimensions.width), y: 0 },
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
		id: input.id,
		stageDimensions: input.stageDimensions,
		position: input.position,
		targetPosition: { x: 0, y: 0 },
		speed: 0.4,
		minStopMS: 500,
		maxStopMS: 500,
		maxEggs: input.maxEggs,
		eggsLaid: 0,
		stationaryEggLayingRate: input.stationaryEggLayingRate,
		movingEggLayingRate: input.movingEggLayingRate,
	}),
	states: {
		'Setting Target Position': {
			entry: 'pickNewTargetXPosition',
			always: { target: 'Moving' },
		},
		Moving: {
			invoke: {
				src: 'animationActor',
				onDone: [
					{
						guard: ({ context }) =>
							context.position.x === context.targetPosition.x,
						target: 'Stopped',
					},
					// {
					// 	guard: 'can lay egg while moving',
					// 	target: 'Laying Egg While Moving',
					// 	reenter: true,
					// 	actions: ['updatePosition'],
					// },
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
					{ guard: 'can lay egg while stopped', target: 'Laying Egg' },
					{ target: 'Moving' },
				],
			},
		},
		'Laying Egg': {
			entry: [
				// log('Hen should lay egg'),
				sendParent(({ context }) => ({
					type: 'Lay an egg',
					henId: context.id,
					henPosition: context.position,
				})),
				assign({
					eggsLaid: ({ context }) => context.eggsLaid + 1,
				}),
			],
			after: { 1000: 'Moving' },
		},
		// 'Laying Egg While Moving': {
		// 	entry: [
		// 		'layEgg',
		// 		assign({
		// 			eggsLaid: ({ context }) => context.eggsLaid + 1,
		// 		}),
		// 	],
		// 	after: { 100: 'Moving' },
		// },
	},
});
