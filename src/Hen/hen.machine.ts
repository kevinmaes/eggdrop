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
			currentTweenSpeed: number;
			currentTweenDuration: number;
			currentTweenStartTime: number;
			// remainingTweenDuration: number;
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
			currentTween: Konva.Tween | null;
		};
		events:
			| { type: 'Set henRef'; henRef: React.RefObject<Konva.Image> }
			| { type: 'Stop moving' }
			| { type: 'Resume game' }
			| { type: 'Pause game' };
	},
	guards: {
		'can lay egg while stopped': ({ context }) => {
			const withinLimit =
				context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs;
			const withinEggLayingRate =
				Math.random() < context.stationaryEggLayingRate;
			const canLayEgg = withinLimit && withinEggLayingRate;
			return canLayEgg;
		},
		'can lay egg while moving': ({ context }) => {
			// return true;
			const withinLimit =
				context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs;
			const withinEggLayingRate = Math.random() < context.movingEggLayingRate;
			return withinLimit && withinEggLayingRate;
		},
	},
	actors: {
		animationActor,
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
		getRandomMidTweenDelay: ({ context }) => {
			if (!context.currentTween) {
				throw new Error('No current tween');
			}
			const currentTime = new Date().getTime();
			const elapsedTime = currentTime - context.currentTweenStartTime;
			const remainingTime = context.currentTweenDuration - elapsedTime;
			const delay = Math.max(Math.random() * remainingTime, 0);
			// console.log({
			// 	currentTweenDuration: context.currentTweenDuration,
			// 	currentTweenStartTime: context.currentTweenStartTime,
			// 	currentTime,
			// 	elapsedTime,
			// 	remainingTime,
			// 	delay,
			// });
			return delay;
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
		currentTweenSpeed: 0,
		currentTweenDuration: 0,
		currentTweenStartTime: 0,
		// remainingTweenDuration: 0,
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
		currentTween: null,
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
			entry: [
				assign({
					targetPosition: ({ context }) => ({
						x: pickXPosition(context.minX, context.maxX),
						y: HEN_Y_POSITION,
					}),
				}),
				assign(({ context }) => {
					const { targetPosition } = context;
					const totalDistance = STAGE_DIMENSIONS.width;
					const xDistance = targetPosition.x - context.position.x;
					const direction = xDistance > 0 ? 1 : -1;
					const relativeDistance = xDistance / totalDistance;

					// Calculate current tween speed
					const currentTweenSpeed =
						direction * (1 - relativeDistance * context.speed);

					// Calculate absolute distances for tween duration
					const absoluteXDistance = Math.abs(xDistance);
					const absoluteRelativeDistance = absoluteXDistance / totalDistance;
					const duration =
						context.baseTweenDurationSeconds *
						(1 - absoluteRelativeDistance * context.speed);

					const tween = new Konva.Tween({
						node: context.henRef.current!,
						duration,
						x: targetPosition.x,
						y: targetPosition.y,
						easing: Konva.Easings.EaseInOut,
					});

					return {
						currentTweenSpeed,
						currentTweenDuration: duration,
						currentTweenStartTime: new Date().getTime(),
						// remainingTweenDuration: duration,
						currentTween: tween,
					};
				}),
			],
			exit: assign({
				currentTweenSpeed: 0,
			}),
			invoke: {
				src: 'animationActor',
				input: ({ context }) => ({
					node: context.henRef.current,
					tween: context.currentTween,
				}),
				onDone: {
					target: 'Stopped',
					actions: assign({
						position: ({ event }) => event.output.endPosition,
						currentTweenSpeed: 0,
					}),
				},
				onError: { target: 'Stopped' },
			},
			initial: 'Not laying egg',
			states: {
				'Not laying egg': {
					after: {
						getRandomMidTweenDelay: [
							{
								guard: 'can lay egg while moving',
								target: 'Laying egg',
							},
							{ target: 'Not laying egg', reenter: true },
						],
					},
				},
				'Laying egg': {
					entry: [
						sendParent(({ context }) => {
							console.log(
								'Hen Moving > Laying Egg: sending parent currentTweenSpeed',
								context.currentTweenSpeed
							);
							return {
								type: 'Lay an egg',
								henId: context.id,
								henCurentTweenSpeed: context.currentTweenSpeed,
								henPosition: context.henRef.current!.getPosition(),
								hatchRate: context.hatchRate,
							};
						}),
						assign({
							eggsLaid: ({ context }) => context.eggsLaid + 1,
						}),
					],
					after: {
						250: 'Done laying egg',
					},
				},
				'Done laying egg': {
					after: {
						500: 'Not laying egg',
					},
				},
			},
		},
		Stopped: {
			on: {
				'Resume game': 'Moving',
			},
			after: {
				getRandomStopDurationMS: [
					{ guard: 'can lay egg while stopped', target: 'Laying Egg' },
					{ target: 'Moving' },
				],
			},
		},
		'Laying Egg': {
			entry: [
				sendParent(({ context }) => ({
					type: 'Lay an egg',
					henId: context.id,
					henCurentTweenSpeed: context.currentTweenSpeed,
					henPosition: context.henRef.current!.getPosition(),
					hatchRate: context.hatchRate,
				})),
				assign({
					eggsLaid: ({ context }) => context.eggsLaid + 1,
				}),
			],
			after: { 1000: 'Moving' },
		},
	},
});
