import { assign, log, sendParent, setup } from 'xstate';
import Konva from 'konva';
import { Position } from '../GameLevel/types';
import {
	HEN_Y_POSITION,
	STAGE_DIMENSIONS,
	STAGGERED_HEN_DELAY_MS,
} from '../GameLevel/gameConfig';
import { animationActor } from '../animation';

export function pickXPosition(minX: number, maxX: number, buffer: number = 50) {
	const range = maxX - minX;
	let randomPosition = Math.random() * range + minX;
	if (randomPosition < buffer) return buffer;
	if (randomPosition > maxX - buffer) return maxX - buffer;
	return randomPosition;
}

export const henMachine = setup({
	types: {} as {
		input: {
			id: string;
			position: Position;
			stageDimensions: { width: number; height: number };
			maxEggs: number;
			stationaryEggLayingRate: number;
			movingEggLayingRate: number;
			speed: number;
			baseTweenDurationSeconds: number;
			hatchRate: number;
			minStopMS: number;
			maxStopMS: number;
			minX: number;
			maxX: number;
		};
		context: {
			henRef: React.RefObject<Konva.Image>;
			id: string;
			stageDimensions: { width: number; height: number };
			position: Position;
			targetPosition: Position;
			speed: number;
			baseTweenDurationSeconds: number;
			minStopMS: number;
			maxStopMS: number;
			maxEggs: number;
			eggsLaid: number;
			stationaryEggLayingRate: number;
			movingEggLayingRate: number;
			gamePaused: boolean;
			hatchRate: number;
			minX: number;
			maxX: number;
		};
		events:
			| { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
			// | { type: 'Stop moving'; atPosition: Position }
			| { type: 'Stop moving' }
			| { type: 'Resume game' }
			| { type: 'Pause game' };
	},
	guards: {
		'can lay egg while stopped': ({ context }) => {
			return true;
			const withinLimit =
				context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs;
			const withinEggLayingRate =
				Math.random() < context.stationaryEggLayingRate;
			const canLayEgg = withinLimit && withinEggLayingRate;
			return canLayEgg;
		},
		'can lay egg while moving': ({ context }) => {
			const withinLimit =
				context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs;
			const withinEggLayingRate = Math.random() < context.movingEggLayingRate;
			return withinLimit && withinEggLayingRate;
		},
	},
	actors: {
<<<<<<< HEAD
		animationActor,
=======
		tweenActor: fromPromise<
			{ endPosition: Position },
			{
				henRef: React.RefObject<Konva.Image>;
				speed: number;
				baseTweenDurationSeconds: number;
				position: Position;
				minX: number;
				maxX: number;
			}
		>(({ input }) => {
			return new Promise((resolve, reject) => {
				if (input.henRef.current) {
					const targetPosition = {
						x: pickXPosition(input.minX, input.maxX),
						y: HEN_Y_POSITION,
					};
					const totalDistance = STAGE_DIMENSIONS.width;
					const xDistance = Math.abs(targetPosition.x - input.position.x);
					const relativeDistance = xDistance / totalDistance;
					const duration =
						input.baseTweenDurationSeconds *
						(1 - relativeDistance * input.speed);

					const tween = new Konva.Tween({
						node: input.henRef.current,
						duration,
						x: targetPosition.x,
						easing: Konva.Easings.EaseInOut,
						onFinish: () => {
							tween.destroy();
							return resolve({ endPosition: targetPosition });
						},
					});
					tween.play();
				} else {
					reject('No henRef');
				}
			});
		}),
>>>>>>> egg-animation-actor
	},
	delays: {
		getRandomStartDelay: () =>
			Math.ceil(Math.random() * STAGGERED_HEN_DELAY_MS),
		getRandomStopDurationMS: ({ context }) => {
			const { minStopMS, maxStopMS } = context;
			// If values mutate to cross over, return the min value.
			if (minStopMS >= maxStopMS) return minStopMS;

			// Pick a value somewhere between the min and max stop duration.
			return Math.random() * (maxStopMS - minStopMS) + minStopMS;
		},
	},
}).createMachine({
	id: 'hen',
	initial: 'Offscreen',
	context: ({ input }) => ({
		henRef: { current: null },
		id: input.id,
		stageDimensions: input.stageDimensions,
		position: input.position,
		targetPosition: { x: input.position.x, y: input.position.y },
		speed: input.speed,
		baseTweenDurationSeconds: input.baseTweenDurationSeconds,
		minStopMS: input.minStopMS,
		maxStopMS: input.maxStopMS,
		maxEggs: input.maxEggs,
		eggsLaid: 0,
		stationaryEggLayingRate: input.stationaryEggLayingRate,
		movingEggLayingRate: input.movingEggLayingRate,
		gamePaused: false,
		hatchRate: input.hatchRate,
		minX: input.minX,
		maxX: input.maxX,
	}),
	on: {
		'Set henRef': {
			actions: assign({
				henRef: ({ event }) => event.henRef,
			}),
		},
		'Pause game': {
			target: '.Stopped',
			actions: assign({
				gamePaused: true,
			}),
		},
	},
	states: {
		Offscreen: {
			after: {
				getRandomStartDelay: { target: 'Moving' },
			},
		},
		Moving: {
			invoke: {
				src: 'animationActor',
				input: ({ context }) => {
					const targetPosition = {
						x: pickXPosition(context.minX, context.maxX),
						y: HEN_Y_POSITION,
					};
					const totalDistance = STAGE_DIMENSIONS.width;
					const xDistance = Math.abs(targetPosition.x - context.position.x);
					const relativeDistance = xDistance / totalDistance;
					const duration =
						context.baseTweenDurationSeconds *
						(1 - relativeDistance * context.speed);

					const tween = new Konva.Tween({
						node: context.henRef.current!,
						duration,
						x: targetPosition.x,
						y: targetPosition.y,
						easing: Konva.Easings.EaseInOut,
					});

					return {
						node: context.henRef.current,
						tween,
					};
				},
				onDone: {
					target: 'Stopped',
					actions: assign({
						position: ({ event }) => event.output.endPosition,
					}),
				},
				onError: { target: 'Stopped' },
			},
		},
		Stopped: {
			on: {
				'Resume game': 'Moving',
			},
			after: {
				getRandomStopDurationMS: [
					{ guard: ({ context }) => context.gamePaused },
					{ guard: 'can lay egg while stopped', target: 'Laying Egg' },
					{ target: 'Moving' },
				],
			},
		},
		'Laying Egg': {
			entry: [
				log('Hen laying egg'),
				sendParent(({ context }) => ({
					type: 'Lay an egg',
					henId: context.id,
					henPosition: context.position,
					hatchRate: context.hatchRate,
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
