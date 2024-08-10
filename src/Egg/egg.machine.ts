import { setup, assign, sendParent, fromPromise, AnyActorRef } from 'xstate';
import { Position } from '../GameLevel/types';
import { sounds } from '../sounds';
import Konva from 'konva';
import { CHEF_POT_RIM_CONFIG, STAGE_DIMENSIONS } from '../GameLevel/gameConfig';
import { tweenActor } from '../motionActors';

export type EggResultStatus = null | 'Hatched' | 'Broken' | 'Caught';
export const eggMachine = setup({
	types: {} as {
		context: {
			eggRef: React.RefObject<Konva.Image>;
			id: string;
			henId: string;
			initialPosition: Position;
			position: Position;
			targetPosition: Position;
			fallingSpeed: number;
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

		input: {
			id: string;
			henId: string;
			position: Position;
			fallingSpeed: number;
			henCurentTweenSpeed: number;
			rotationDirection: -1 | 0 | 1;
			floorY: number;
			hatchRate: number;
		};
	},
	actors: {
		staticEggFallingActor: tweenActor,
		movingEggFallingActor: fromPromise<
			void,
			{
				eggRef: React.RefObject<Konva.Image>;
				initialPosition: Position;
				xSpeed: number;
				rotationDirection: -1 | 0 | 1;
				parentRef: AnyActorRef;
			}
		>(({ input }) => {
			return new Promise((resolve, reject) => {
				if (!input.eggRef.current) {
					throw new Error('No eggRef');
				}
				const animation = new Konva.Animation((frame) => {
					if (!input.eggRef.current) {
						animation.stop();
						return reject('No eggRef');
					} else if (input.eggRef.current.y() >= STAGE_DIMENSIONS.height) {
						animation.stop();
						resolve();
					}

					if (frame) {
						// Calculate new x and y positions
						const newXPos = input.eggRef.current.x() + input.xSpeed;
						input.eggRef.current.x(newXPos);
						const newYPos = input.initialPosition.y + frame.time * 0.5;
						input.eggRef.current.y(newYPos);

						// Rotate the egg
						const currentRotation = input.eggRef.current.rotation();
						const newRotation = currentRotation + input.rotationDirection * 5;
						input.eggRef.current.rotation(newRotation);

						// Send a message to the parent to update the egg position
						input.parentRef.send({ type: 'Notify of animation position' });
					}
				});
				animation.start();
			});
		}),
		chickExitingStageActor: tweenActor,
	},
	guards: {
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
				x: Math.random() > 0.5 ? window.innerWidth + 50 : -50,
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
		id: input.id,
		henId: input.henId,
		initialPosition: input.position,
		position: input.position,
		targetPosition: input.position,
		fallingSpeed: input.fallingSpeed,
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
					target: 'FallingWithMotion',
					actions: assign({
						eggRef: ({ event }) => event.eggRef,
					}),
				},
			},
		},
		FallingWithMotion: {
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
			invoke: {
				src: 'movingEggFallingActor',
				input: ({ context, self }) => {
					return {
						eggRef: context.eggRef,
						initialPosition: context.initialPosition,
						xSpeed: context.henCurentTweenSpeed,
						rotationDirection: context.rotationDirection,
						parentRef: self,
					};
				},
				onDone: {
					target: 'Landed',
				},
			},
		},
		FallingWithAnimation: {
			entry: [
				'setNewTargetPosition',
				assign({
					currentTween: ({ context, self }) => {
						if (!context.eggRef.current) {
							return null;
						}
						return new Konva.Tween({
							node: context.eggRef.current,
							duration: 3,
							x: context.targetPosition.x,
							y: context.targetPosition.y,
							rotation: Math.random() > 0.5 ? 720 : -720,
							onUpdate: () =>
								self.send({ type: 'Notify of animation position' }),
						});
					},
				}),
			],
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
			invoke: {
				src: 'staticEggFallingActor',
				input: ({ context }) => {
					return {
						node: context.eggRef.current,
						tween: context.currentTween,
					};
				},
				onDone: 'Landed',
			},
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
			entry: ['setTargetPositionToExit'],
			invoke: {
				src: 'chickExitingStageActor',
				input: ({ context }) => {
					const tween = new Konva.Tween({
						node: context.eggRef.current!,
						duration: 1,
						x: context.targetPosition.x,
						y: context.targetPosition.y,
					});

					return {
						node: context.eggRef.current,
						tween,
					};
				},
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
