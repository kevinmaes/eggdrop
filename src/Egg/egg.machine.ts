import { setup, assign, sendParent } from 'xstate';
import { Position } from '../GameLevel/types';
import { sounds } from '../sounds';
import Konva from 'konva';
import { CHEF_POT_RIM_CONFIG, EGG_CONFIG } from '../GameLevel/gameConfig';
import { tweenActor } from '../motionActors';
import { eggMotionActor } from './eggMotionActor';

export type EggResultStatus = null | 'Hatched' | 'Broken' | 'Caught';
export const eggMachine = setup({
	types: {} as {
		input: {
			eggConfig: typeof EGG_CONFIG;
			id: string;
			henId: string;
			henIsMoving: boolean;
			position: Position;
			henCurentTweenSpeed: number;
			rotationDirection: -1 | 0 | 1;
			floorY: number;
			hatchRate: number;
		};
		context: {
			eggRef: React.RefObject<Konva.Image>;
			eggConfig: typeof EGG_CONFIG;
			id: string;
			henId: string;
			henIsMoving: boolean;
			initialPosition: Position;
			position: Position;
			targetPosition: Position;
			henCurentTweenSpeed: number;
			rotationDirection: -1 | 0 | 1;
			exitingSpeed: number;
			floorY: number;
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
			| { type: 'Notify of animation position' };
	},
	actors: {
		staticFallingActor: tweenActor,
		movingFallingActor: eggMotionActor,
		chickExitingStageActor: tweenActor,
	},
	guards: {
		isHenMoving: ({ context }) => context.henIsMoving,
		eggCanHatch: ({ context }) => Math.random() < context.hatchRate,
		isEggNearChefPot: ({ context }) => {
			if (!context.eggRef.current) return false;
			return (
				context.eggRef.current.y() >= CHEF_POT_RIM_CONFIG.y &&
				context.eggRef.current.y() <=
					CHEF_POT_RIM_CONFIG.y + CHEF_POT_RIM_CONFIG.height
			);
		},
	},
	actions: {
		setNewTargetPosition: assign({
			targetPosition: ({ context }) => ({
				x: context.position.x,
				y: context.floorY - 30,
			}),
		}),
		setTargetPositionToExit: assign({
			targetPosition: ({ context }) => ({
				x:
					context.position.x > 0.5 * window.innerWidth
						? window.innerWidth + 50
						: -50,
				y: context.floorY - 60,
			}),
		}),
		splatOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x - 20,
				y: context.floorY - 50,
			}),
		}),
		playSplatSound: () => {
			sounds.splat.play();
		},
		hatchOnFloor: assign({
			position: ({ context }) => ({
				x: context.position.x,
				y: context.floorY - 60,
			}),
		}),
		playHatchSound: () => {
			sounds.hatch.play();
			setTimeout(() => {
				sounds.yipee.play();
			}, 500);
		},
	},
}).createMachine({
	id: 'egg',
	initial: 'Idle',
	context: ({ input }) => ({
		eggRef: { current: null },
		eggConfig: input.eggConfig,
		id: input.id,
		henId: input.henId,
		henIsMoving: input.henIsMoving,
		initialPosition: input.position,
		position: input.position,
		targetPosition: input.position,
		henCurentTweenSpeed: input.henCurentTweenSpeed,
		rotationDirection: input.rotationDirection,
		exitingSpeed: 10,
		exitPosition: {
			x: Math.random() > 0.5 ? window.innerWidth + 50 : -50,
			y: input.floorY - 50,
		},
		floorY: input.floorY,
		resultStatus: null,
		gamePaused: false,
		hatchRate: input.hatchRate,
		currentTween: null,
		currentAnimation: null,
	}),
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
			on: {
				'Notify of animation position': {
					guard: 'isEggNearChefPot',
					actions: sendParent(({ context }) => ({
						type: 'Egg position updated',
						eggId: context.id,
						position: context.eggRef.current!.getPosition(),
					})),
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
							target: 'Straight Down',
							guard: 'isHenMoving',
						},
						{ target: 'At an Angle' },
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
									duration: context.eggConfig.fallingDuration,
									x: context.targetPosition.x,
									y: context.targetPosition.y,
									rotation: Math.random() > 0.5 ? 720 : -720,
									onUpdate: () =>
										self.send({ type: 'Notify of animation position' }),
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
						onDone: 'Done Falling',
					},
				},
				'At an Angle': {
					invoke: {
						src: 'movingFallingActor',
						input: ({ context, self }) => ({
							node: context.eggRef.current,
							initialPosition: context.initialPosition,
							xSpeed: context.henCurentTweenSpeed,
							ySpeed: context.eggConfig.fallingSpeed,
							rotationDirection: context.rotationDirection,
							parentRef: self,
						}),
						onDone: 'Done Falling',
					},
				},
				'Done Falling': {
					type: 'final',
				},
			},
			onDone: 'Landed',
		},
		Landed: {
			// Set this in the Landed state so the chick is already
			// facing the right direction based on its exit direction
			entry: 'setTargetPositionToExit',
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
			tags: 'chick',
			entry: assign({
				resultStatus: 'Hatched',
			}),
			after: {
				1000: 'Exiting',
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
					resultStatus: context.resultStatus,
				})),
			],
		},
	},
});
