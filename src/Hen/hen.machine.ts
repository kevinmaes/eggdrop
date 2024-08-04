import { assign, sendParent, setup } from 'xstate';
import Konva from 'konva';
import { Position } from '../GameLevel/types';
import {
	HEN_Y_POSITION,
	STAGE_DIMENSIONS,
	STAGGERED_HEN_DELAY_MS,
} from '../GameLevel/gameConfig';
import { animationActor } from '../animation';
import { GameAssets, SpriteData } from '../types/assets';

export function pickXPosition(minX: number, maxX: number, buffer: number = 50) {
	const range = maxX - minX;
	let randomPosition = Math.random() * range + minX;
	if (randomPosition < buffer) return buffer;
	if (randomPosition > maxX - buffer) return maxX - buffer;
	return randomPosition;
}

export const henMachine: any = setup({
	types: {} as {
		input: {
			id: string;
			henAssets: GameAssets['hen'];
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
			henAssets: { sprite: SpriteData };
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
			return true;
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
		getRandomStartDelay: () => {
			return 2000;
			return Math.ceil(Math.random() * STAGGERED_HEN_DELAY_MS);
		},
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
		henAssets: input.henAssets,
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
				assign({
					currentTween: ({ context }) => {
						const { targetPosition } = context;
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

						return tween;
					},
				}),
			],
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
					}),
				},
				onError: { target: 'Stopped' },
			},
			// TODO: Start to implement egg laying while moving
			// Need to include hen speed and more random timing of when to lay eggs.
			// after: {
			// 	1000: {
			// 		target: 'Moving',
			// 		actions: [
			// 			log('Laying while moving'),
			// 			sendParent(({ context }) => ({
			// 				type: 'Lay an egg',
			// 				henId: context.id,
			// 				henPosition: context.henRef.current!.getPosition(),
			// 				hatchRate: context.hatchRate,
			// 			})),
			// 			assign({
			// 				eggsLaid: ({ context }) => context.eggsLaid + 1,
			// 			}),
			// 		],
			// 	},
			// },
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
			tags: 'laying',
			entry: [
				sendParent(({ context }) => ({
					type: 'Lay an egg',
					henId: context.id,
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
