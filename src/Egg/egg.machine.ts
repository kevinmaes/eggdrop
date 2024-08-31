import { setup, assign, sendParent } from 'xstate';
import { sounds } from '../sounds';
import Konva from 'konva';
import { getGameConfig } from '../GameLevel/gameConfig';
import { tweenActor } from '../motionActors';
import { eggMotionActor } from './eggMotionActor';
import { GameAssets } from '../types/assets';
import { Direction, Position } from '../types';

export type EggResultStatus = null | 'Hatched' | 'Broken' | 'Caught';
export const eggMachine = setup({
	types: {} as {
		input: {
			gameConfig: ReturnType<typeof getGameConfig>;
			id: string;
			eggAssets: GameAssets['egg'];
			chickAssets: GameAssets['chick'];
			henId: string;
			henIsMoving: boolean;
			position: Position;
			henCurentTweenSpeed: number;
			color: 'white' | 'gold' | 'black';
			rotationDirection: Direction['value'];
			hatchRate: number;
		};
		context: {
			gameConfig: ReturnType<typeof getGameConfig>;
			eggRef: React.RefObject<Konva.Image>;
			id: string;
			henId: string;
			eggAssets: GameAssets['egg'];
			chickAssets: GameAssets['chick'];
			henIsMoving: boolean;
			initialPosition: Position;
			position: Position;
			targetPosition: Position;
			color: 'white' | 'gold' | 'black';
			henCurentTweenSpeed: number;
			rotationDirection: Direction['value'];
			exitingSpeed: number;
			resultStatus: EggResultStatus;
			gamePaused: boolean;
			hatchRate: number;
			currentTween: Konva.Tween | null;
			currentAnimation: Konva.Animation | null;
		};
		events:
			| { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
			| { type: 'Land on floor' }
			| { type: 'Catch' }
			| { type: 'Finished exiting' }
			| { type: 'Resume game' }
			| { type: 'Pause game' }
			| { type: 'Notify of animation position'; position: Position };
	},
	actors: {
		staticFallingActor: tweenActor,
		movingFallingActor: eggMotionActor,
		chickExitingStageActor: tweenActor,
		hatchingAnimation: tweenActor,
	},
	guards: {
		isHenMoving: ({ context }) => context.henIsMoving,
		eggCanHatch: ({ context }) => {
			if (context.color === 'black') {
				return false;
			}
			if (context.color === 'gold') {
				return true;
			}
			return Math.random() < context.hatchRate;
		},
		isEggNearChefPot: ({ context }) => {
			if (!context.eggRef.current) return false;
			return context.eggRef.current.y() >= context.gameConfig.chef.y;
		},
	},
	actions: {
		setNewTargetPosition: assign({
			targetPosition: ({ context }) => ({
				x: context.position.x,
				y:
					context.gameConfig.stageDimensions.height -
					context.gameConfig.egg.brokenEgg.height -
					context.gameConfig.stageDimensions.margin,
			}),
		}),
		setTargetPositionToExit: assign({
			targetPosition: ({ context }) => ({
				x:
					context.position.x > context.gameConfig.stageDimensions.midX
						? context.gameConfig.stageDimensions.width + 50
						: -50,
				y: context.position.y,
			}),
		}),
		setPositionToAnimationEndPostiion: assign({
			position: (_, params: Position) => params,
		}),
		// notifyParentOfPosition: sendParent(
		// 	(_, params: { eggId: string; position: Position }) => ({
		// 		type: 'Egg position updated',
		// 		eggId: params.eggId,
		// 		position: params.position,
		// 	})
		// ),
		notifyParentOfPosition: sendParent(
			(_, params: { eggId: string; position: Position }) => {
				// console.log('notifyParentOfPosition', params);
				return {
					type: 'Egg position updated',
					eggId: params.eggId,
					position: params.position,
				};
			}
		),
		splatOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x - 0.5 * context.gameConfig.egg.brokenEgg.width,
				y:
					context.gameConfig.stageDimensions.height -
					context.gameConfig.egg.brokenEgg.height,
			}),
		}),
		playSplatSound: () => {
			sounds.splat.play();
		},
		hatchOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x,
				y:
					context.gameConfig.stageDimensions.height -
					context.gameConfig.egg.chick.height -
					context.gameConfig.stageDimensions.margin,
			}),
		}),
		playHatchSound: () => {
			sounds.hatch.play();
		},
		playHatchYipeeSound: () => {
			sounds.yipee.play();
		},
	},
}).createMachine({
	id: 'egg',
	initial: 'Idle',
	context: ({ input }) => {
		return {
			gameConfig: input.gameConfig,
			eggRef: { current: null },
			id: input.id,
			henId: input.henId,
			eggAssets: input.eggAssets,
			chickAssets: input.chickAssets,
			henIsMoving: input.henIsMoving,
			initialPosition: input.position,
			position: input.position,
			targetPosition: input.position,
			henCurentTweenSpeed: input.henCurentTweenSpeed,
			color: input.color,
			rotationDirection: input.rotationDirection,
			exitingSpeed: 10,
			resultStatus: null,
			gamePaused: false,
			hatchRate: input.hatchRate,
			currentTween: null,
			currentAnimation: null,
		};
	},
	on: {
		'Pause game': {
			actions: assign({
				gamePaused: true,
			}),
		},
	},
	states: {
		Idle: {
			on: {
				'Set eggRef': {
					target: 'Falling',
					actions: assign({
						eggRef: ({ event }) => event.eggRef,
					}),
				},
			},
		},
		Falling: {
			tags: 'falling',
			on: {
				'Notify of animation position': {
					guard: 'isEggNearChefPot',
					actions: {
						type: 'notifyParentOfPosition',
						params: ({ context, event }) => ({
							eggId: context.id,
							position: event.position,
						}),
					},
				},
				Catch: {
					target: 'Done',
					actions: assign({
						resultStatus: 'Caught',
					}),
				},
			},
			initial: 'Init Falling',
			states: {
				'Init Falling': {
					always: [
						{
							guard: 'isHenMoving',
							target: 'At an Angle',
						},
						{ target: 'Straight Down' },
					],
				},
				'Straight Down': {
					entry: [
						'setNewTargetPosition',
						assign({
							currentTween: ({ context, self }) => {
								if (!context.eggRef.current) {
									return null;
								}
								return new Konva.Tween({
									node: context.eggRef.current,
									duration: context.gameConfig.egg.fallingDuration,
									x: context.targetPosition.x,
									y: context.targetPosition.y,
									rotation: Math.random() > 0.5 ? 720 : -720,
									onUpdate: () => {
										if (self.getSnapshot().status === 'active') {
											self.send({
												type: 'Notify of animation position',
												position: {
													x: context.eggRef.current!.x(),
													y: context.eggRef.current!.y(),
												},
											});
										}
									},
								});
							},
						}),
					],
					invoke: {
						src: 'staticFallingActor',
						input: ({ context }) => ({
							node: context.eggRef.current,
							tween: context.currentTween,
						}),
						onDone: {
							target: 'Done Falling',
							actions: {
								type: 'setPositionToAnimationEndPostiion',
								params: ({ event }) => event.output,
							},
						},
					},
				},
				'At an Angle': {
					invoke: {
						src: 'movingFallingActor',
						input: ({ context, self }) => ({
							parentRef: self,
							node: context.eggRef.current,
							initialPosition: context.initialPosition,
							xSpeed: context.henCurentTweenSpeed,
							ySpeed: context.gameConfig.egg.fallingSpeed,
							rotationDirection: context.rotationDirection,
							testForDestination: (yPos) =>
								yPos >=
								context.gameConfig.stageDimensions.height -
									context.gameConfig.egg.brokenEgg.height -
									context.gameConfig.stageDimensions.margin,
						}),
						onDone: {
							target: 'Done Falling',
							actions: {
								type: 'setPositionToAnimationEndPostiion',
								params: ({ event }) => event.output,
							},
						},
					},
				},
				'Done Falling': {
					type: 'final',
				},
			},
			onDone: 'Landed',
		},
		Landed: {
			always: [
				{
					guard: 'eggCanHatch',
					target: 'Hatching',
					actions: ['hatchOnFloor', 'playHatchSound'],
				},
				{
					target: 'Splatting',
					actions: ['splatOnFloor', 'playSplatSound'],
				},
			],
		},
		Hatching: {
			entry: 'playHatchYipeeSound',
			initial: 'Jumping Up',
			states: {
				'Jumping Up': {
					invoke: {
						src: 'hatchingAnimation',
						input: ({ context }) => ({
							node: context.eggRef.current,
							tween: new Konva.Tween({
								node: context.eggRef.current!,
								duration: 0.4,
								x: context.position.x,
								y: context.position.y - 70,
								easing: Konva.Easings.EaseOut,
							}),
						}),
						onDone: 'Bouncing Down',
					},
				},
				'Bouncing Down': {
					invoke: {
						src: 'hatchingAnimation',
						input: ({ context }) => ({
							node: context.eggRef.current,
							tween: new Konva.Tween({
								node: context.eggRef.current!,
								y: context.eggRef.current!.y() + 70,
								duration: 0.4,
								easing: Konva.Easings.BounceEaseOut,
							}),
						}),
						onDone: 'Animation Done',
					},
				},
				'Animation Done': {
					type: 'final',
				},
			},
			onDone: 'Hatched',
		},
		Hatched: {
			entry: [
				assign({
					resultStatus: 'Hatched',
				}),
			],
			after: {
				500: 'Exiting',
			},
		},
		Splatting: {
			entry: assign({
				resultStatus: 'Broken',
			}),
			after: {
				1000: 'Done',
			},
		},
		Exiting: {
			tags: 'chick',
			entry: ['setTargetPositionToExit'],
			invoke: {
				src: 'chickExitingStageActor',
				input: ({ context }) => ({
					node: context.eggRef.current,
					tween: new Konva.Tween({
						node: context.eggRef.current!,
						duration: 1,
						x: context.targetPosition.x,
						y: context.targetPosition.y,
					}),
				}),
				onDone: 'Done',
			},
		},
		Done: {
			type: 'final',
			entry: [
				sendParent(({ context }) => ({
					type: 'Egg done',
					henId: context.henId,
					eggId: context.id,
					eggColor: context.color,
					resultStatus: context.resultStatus,
				})),
			],
		},
	},
});
