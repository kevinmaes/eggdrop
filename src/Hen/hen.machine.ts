import { assign, sendParent, setup } from 'xstate';
import Konva from 'konva';
import { Position } from '../GameLevel/types';
import {
	HEN_Y_POSITION,
	STAGE_DIMENSIONS,
	STAGGERED_HEN_DELAY_MS,
} from '../GameLevel/gameConfig';
import { tweenActor } from '../motionActors';

export function pickXPosition(minX: number, maxX: number, buffer: number = 50) {
	const xDistanceRange = maxX - minX;
	let randomXPosition = Math.random() * xDistanceRange + minX;
	if (randomXPosition < buffer) return buffer;
	if (randomXPosition > maxX - buffer) return maxX - buffer;
	return randomXPosition;
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
			currentTweenDurationMS: number;
			currentTweenStartTime: number;
			currentTweenDirection: -1 | 0 | 1;
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

			// Check if we're within the total egg limit
			const withinTotalEggLimit =
				context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs;

			// Check if we're within the egg laying rate
			const withinEggLayingRate = Math.random() < context.movingEggLayingRate;

			// Check if we're near the end of the tween
			const currentTime = new Date().getTime();
			const elapsedMS = currentTime - context.currentTweenStartTime;
			const remainingMS = context.currentTweenDurationMS - elapsedMS;
			const notEndingMovement = remainingMS > 500;

			// Determine if we can lay an egg based on all three conditions
			const canLayEgg =
				withinTotalEggLimit && withinEggLayingRate && notEndingMovement;

			console.log(
				'guard',
				withinTotalEggLimit,
				withinEggLayingRate,
				notEndingMovement,
				canLayEgg
			);
			return canLayEgg;
		},
	},
	actors: {
		henMovingBackAndForthActor: tweenActor,
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
		restAfterLayingAnEgg: () => 1000,
		getRandomMidTweenDelay: ({ context }) => {
			if (!context.currentTween) {
				throw new Error('No current tween');
			}
			// const easeInDelay = 500;
			const currentTime = new Date().getTime();
			const elapsedTime = currentTime - context.currentTweenStartTime;
			const remainingTime = context.currentTweenDurationMS - elapsedTime;
			// const delay = easeInDelay + Math.max(Math.random() * remainingTime, 0);
			const delay = Math.max(Math.random() * remainingTime, 0);

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
		currentTweenDurationMS: 0,
		currentTweenStartTime: 0,
		currentTweenDirection: 0,
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

					// Calculate absolute distances for tween duration
					const absoluteXDistance = Math.abs(xDistance);
					const absoluteRelativeDistance = absoluteXDistance / totalDistance;

					const duration =
						context.baseTweenDurationSeconds *
						(1 - absoluteRelativeDistance * context.speed);

					// New calculation here...
					const totalSpeed = xDistance / duration;
					// TODO: Don't love this magic number 240
					const speedPerFrame = totalSpeed / 240;

					const tween = new Konva.Tween({
						node: context.henRef.current!,
						duration,
						x: targetPosition.x,
						y: targetPosition.y,
						easing: Konva.Easings.EaseInOut,
					});

					return {
						currentTweenSpeed: speedPerFrame,
						currentTweenDurationMS: duration * 1000,
						currentTweenStartTime: new Date().getTime(),
						currentTweenDirection: direction,
						currentTween: tween,
					};
				}),
			],
			exit: assign({
				currentTweenSpeed: 0,
			}),
			invoke: {
				src: 'henMovingBackAndForthActor',
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
						// Wait 500ms to delay laying an egg until after tween ease-in
						500: 'Preparing to lay egg',
					},
				},
				'Preparing to lay egg': {
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
							return {
								type: 'Lay an egg',
								henId: context.id,
								henCurentTweenSpeed: context.currentTweenSpeed,
								henCurrentTweenDirection: context.currentTweenDirection,
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
						restAfterLayingAnEgg: 'Not laying egg',
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
					henCurrentTweenDirection: context.currentTweenDirection,
					henPosition: context.henRef.current!.getPosition(),
					hatchRate: context.hatchRate,
				})),
				assign({
					eggsLaid: ({ context }) => context.eggsLaid + 1,
				}),
			],
			after: { restAfterLayingAnEgg: 'Moving' },
		},
	},
});
