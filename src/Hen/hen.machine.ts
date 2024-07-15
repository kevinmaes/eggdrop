import { assign, sendParent, setup } from 'xstate';
import { Ref } from 'react';
import Konva from 'konva';
import { Position } from '../GameLevel/types';
import {
	HEN_Y_POSITION,
	STAGGERED_HEN_DELAY_MS,
} from '../GameLevel/gameConfig';

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
			minX: number;
			maxX: number;
		};
		context: {
			henRef: Ref<Konva.Image>;
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
			| { type: 'Set henRef'; henRef: Ref<Konva.Image> }
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
			targetPosition: {
				x: pickXPosition(context.minX, context.maxX),
				y: HEN_Y_POSITION,
			},
		})),
		updatePosition: assign({
			position: ({ context }) => context.targetPosition,
		}),
	},
	delays: {
		getRandomStartDelay: () => Math.random() * STAGGERED_HEN_DELAY_MS,
		pickStopDuration: ({ context }) => {
			const { minStopMS, maxStopMS } = context;
			return Math.random() * (maxStopMS - minStopMS) + minStopMS;
		},
	},
}).createMachine({
	id: 'hen',
	initial: 'Offscreen',
	context: ({ input }) => ({
		henRef: null,
		id: input.id,
		stageDimensions: input.stageDimensions,
		position: input.position,
		targetPosition: { x: input.position.x, y: input.position.y },
		speed: input.speed,
		baseTweenDurationSeconds: input.baseTweenDurationSeconds,
		minStopMS: 500,
		maxStopMS: 500,
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
			entry: 'pickNewTargetXPosition',
			on: {
				'Stop moving': { target: 'Stopped' },
			},
		},
		Stopped: {
			entry: 'updatePosition',
			on: {
				'Resume game': 'Moving',
			},
			after: {
				pickStopDuration: [
					{ guard: ({ context }) => context.gamePaused },
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
