import { and, assign, sendParent, setup } from 'xstate';
import Konva from 'konva';
import { Position } from '../GameLevel/types';
import { getGameConfig } from '../GameLevel/gameConfig';
import { GameAssets } from '../types/assets';
import { tweenActor } from '../motionActors';

export const henMachine = setup({
	types: {} as {
		input: {
			gameConfig: ReturnType<typeof getGameConfig>;
			id: string;
			henAssets: GameAssets['hen'];
			position: Position;
			maxEggs: number;
			stationaryEggLayingRate: number;
			movingEggLayingRate: number;
			restAfterLayingEggMS: number;
			speed: number;
			baseTweenDurationSeconds: number;
			blackEggRate: number;
			goldEggRate: number;
			hatchRate: number;
			minStopMS: number;
			maxStopMS: number;
			minX: number;
			maxX: number;
		};
		context: {
			gameConfig: ReturnType<typeof getGameConfig>;
			henRef: React.RefObject<Konva.Image>;
			id: string;
			henAssets: GameAssets['hen'];
			position: Position;
			targetPosition: Position;
			speed: number;
			currentTweenSpeed: number;
			currentTweenDurationMS: number;
			currentTweenStartTime: number;
			currentTweenDirection: -1 | 0 | 1;
			movingDirection: 'left' | 'right' | 'none';
			baseTweenDurationSeconds: number;
			minStopMS: number;
			maxStopMS: number;
			maxEggs: number;
			eggsLaid: number;
			stationaryEggLayingRate: number;
			movingEggLayingRate: number;
			restAfterLayingEggMS: number;
			gamePaused: boolean;
			blackEggRate: number;
			goldEggRate: number;
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
		'has more eggs': ({ context }) =>
			context.maxEggs < 0 ? true : context.eggsLaid < context.maxEggs,
		'is within stationary laying rate': ({ context }) => {
			const withinEggLayingRate =
				Math.random() < context.stationaryEggLayingRate;
			return withinEggLayingRate;
		},
		'is within moving laying rate': ({ context }) => {
			return Math.random() < context.movingEggLayingRate;
		},
		'is not near animation end': ({ context }) => {
			const currentTime = new Date().getTime();
			const elapsedMS = currentTime - context.currentTweenStartTime;
			const remainingMS = context.currentTweenDurationMS - elapsedMS;
			return remainingMS > 400;
		},
		'can lay while stationary': and([
			'has more eggs',
			'is within stationary laying rate',
		]),
		'can lay while moving': and([
			'has more eggs',
			'is within moving laying rate',
			'is not near animation end',
		]),
	},
	actors: {
		henMovingBackAndForthActor: tweenActor,
	},
	delays: {
		getRandomStartDelay: ({ context }) =>
			// Need minimum delay to allow for tween to start
			Math.ceil(Math.random() * context.gameConfig.hen.staggeredEntranceDelay) +
			1000,
		getRandomStopDurationMS: ({ context }) => {
			const { minStopMS, maxStopMS } = context;
			// If values mutate to cross over, return the min value.
			if (minStopMS >= maxStopMS) return minStopMS;

			// Pick a value somewhere between the min and max stop duration.
			return Math.random() * (maxStopMS - minStopMS) + minStopMS;
		},
		restAfterLayingAnEgg: ({ context }) => context.restAfterLayingEggMS,
		getRandomMidTweenDelay: ({ context }) => {
			if (!context.currentTween) {
				throw new Error('No current tween');
			}
			const currentTime = new Date().getTime();
			const elapsedTime = currentTime - context.currentTweenStartTime;
			const remainingMS = context.currentTweenDurationMS - elapsedTime;
			const delay = Math.max(Math.random() * remainingMS, 0);
			return delay;
		},
	},
}).createMachine({
	id: 'hen',
	initial: 'Offscreen',
	context: ({ input }) => ({
		gameConfig: input.gameConfig,
		henRef: { current: null },
		id: input.id,
		henAssets: input.henAssets,
		position: input.position,
		targetPosition: { x: input.position.x, y: input.position.y },
		speed: input.speed,
		currentTweenSpeed: 0,
		currentTweenDurationMS: 0,
		currentTweenStartTime: 0,
		currentTweenDirection: 0,
		movingDirection: 'none',
		baseTweenDurationSeconds: input.baseTweenDurationSeconds,
		minStopMS: input.minStopMS,
		maxStopMS: input.maxStopMS,
		maxEggs: input.maxEggs,
		eggsLaid: 0,
		stationaryEggLayingRate: input.stationaryEggLayingRate,
		movingEggLayingRate: input.movingEggLayingRate,
		restAfterLayingEggMS: input.restAfterLayingEggMS,
		gamePaused: false,
		blackEggRate: input.blackEggRate,
		goldEggRate: input.goldEggRate,
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
				assign(({ context }) => {
					const targetPosition = { ...context.position };
					const newPosition = { ...context.position };

					// Pick a new x target position within the hen motion range
					// and with a minimum distance from the current position
					const minDistance = 200;
					let newXPos: number;
					do {
						// Generate a random x position between minX and maxX
						newXPos =
							Math.round(Math.random() * (context.maxX - context.minX)) +
							context.minX;
					} while (Math.abs(newXPos - context.position.x) < minDistance);
					targetPosition.x = newXPos;

					// Check if the hen is in its original offstage position (first time animation)
					if (context.position.x === context.gameConfig.hen.offstageLeftX) {
						if (targetPosition.x >= context.gameConfig.stageDimensions.midX) {
							// Swith the hen's offstage position to be on the right side
							// closer to the target position (if also on the right side)
							newPosition.x = context.gameConfig.hen.offstageRightX;
						}
					}

					return {
						position: newPosition,
						targetPosition,
					};
				}),
				assign(({ context }) => {
					const { targetPosition } = context;
					const totalDistance = context.gameConfig.stageDimensions.width;
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

					// Important! Make sure the hen node is positioned at the current context.position
					// before starting the tween
					context.henRef.current!.setPosition(context.position);

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
						movingDirection: direction === 1 ? 'right' : 'left',
					};
				}),
			],
			exit: assign({
				currentTweenSpeed: 0,
				currentTweenDirection: 0,
				currentTweenDurationMS: 0,
				currentTweenStartTime: 0,
				currentTween: null,
				movingDirection: 'none',
			}),
			invoke: {
				src: 'henMovingBackAndForthActor',
				input: ({ context }) => ({
					node: context.henRef.current,
					tween: context.currentTween,
				}),
				onDone: {
					target: 'Stopped',
					actions: [
						assign({
							position: ({ event }) => event.output,
							currentTweenSpeed: 0,
						}),
					],
				},
				onError: { target: 'Stopped' },
			},
			initial: 'Not laying egg',
			states: {
				'Not laying egg': {
					after: {
						// Wait 400ms to delay laying an egg until after tween ease-in
						400: 'Preparing to lay egg',
					},
				},
				'Preparing to lay egg': {
					after: {
						getRandomMidTweenDelay: [
							{ guard: 'can lay while moving', target: 'Laying egg' },
							{ target: 'Not laying egg', reenter: true },
						],
					},
				},
				'Laying egg': {
					entry: [
						sendParent(({ context }) => {
							const randomEggColorNumber = Math.random();
							const eggColor =
								randomEggColorNumber < context.blackEggRate
									? 'black'
									: randomEggColorNumber < context.goldEggRate
									? 'gold'
									: 'white';

							return {
								type: 'Lay an egg',
								henId: context.id,
								henCurentTweenSpeed: context.currentTweenSpeed,
								henCurrentTweenDirection: context.currentTweenDirection,
								henPosition: context.henRef.current!.getPosition(),
								eggColor,
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
					{ guard: 'can lay while stationary', target: 'Laying Egg' },
					{ target: 'Moving' },
				],
			},
		},
		'Laying Egg': {
			tags: 'laying',
			entry: [
				sendParent(({ context }) => {
					const randomEggColorNumber = Math.random();
					const eggColor =
						randomEggColorNumber < context.blackEggRate
							? 'black'
							: randomEggColorNumber < context.goldEggRate
							? 'gold'
							: 'white';

					return {
						type: 'Lay an egg',
						henId: context.id,
						henCurentTweenSpeed: context.currentTweenSpeed,
						henCurrentTweenDirection: context.currentTweenDirection,
						henPosition: context.henRef.current!.getPosition(),
						eggColor,
						hatchRate: context.hatchRate,
					};
				}),
				assign({
					eggsLaid: ({ context }) => context.eggsLaid + 1,
				}),
			],
			after: { 500: 'Rest After Laying Egg' },
		},
		'Rest After Laying Egg': {
			after: { restAfterLayingAnEgg: 'Moving' },
		},
	},
});
