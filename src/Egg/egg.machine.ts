import { setup, assign, sendParent, log, fromPromise } from 'xstate';
import { Position } from '../GameLevel/types';
import { sounds } from '../sounds';
import Konva from 'konva';
import { CHEF_POT_RIM_CONFIG, STAGE_DIMENSIONS } from '../GameLevel/gameConfig';
import { animationActor } from '../animation';

export type EggResultStatus = null | 'Hatched' | 'Broken' | 'Caught';
export const eggMachine = setup({
	types: {} as {
		context: {
			eggRef: React.RefObject<Konva.Image>;
			id: string;
			henId: string;
			position: Position;
			targetPosition: Position;
			fallingSpeed: number;
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
			floorY: number;
			hatchRate: number;
		};
	},
	actors: {
		animationActor,
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
		position: input.position,
		targetPosition: input.position,
		fallingSpeed: input.fallingSpeed,
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
				src: fromPromise<void, { eggRef: React.RefObject<Konva.Image> }>(
					({ input, self }) => {
						console.log('invoke fromPromise', input);
						return new Promise((resolve, reject) => {
							const animation = new Konva.Animation((frame) => {
								if (!input.eggRef.current) {
									animation.stop();
									return reject('No eggRef');
								}
								if (frame) {
									const yPos = input.eggRef.current.y();
									console.log('frame.time', frame.time);
									const newYPos = yPos + frame.time * 0.1;
									input.eggRef.current.y(newYPos); // Move the ball down
									self.send({ type: 'Notify of animation position' });
								}

								if (input.eggRef.current.y() >= STAGE_DIMENSIONS.height) {
									animation.stop();
									resolve();
								}
							});
							animation.start();
						});
					}
				),
				input: ({ context }) => {
					return {
						// animation: context.currentAnimation,
						eggRef: context.eggRef,
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
							rotation: -720,
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
				src: 'animationActor',
				input: ({ context }) => {
					return {
						node: context.eggRef.current,
						tween: context.currentTween,
					};
				},
				onDone: { target: 'Landed', actions: log('Going to Landed') },
			},
		},
		Landed: {
			always: [
				{
					guard: 'eggCanHatch',
					target: 'Hatching',
					actions: [log('should hatch'), 'hatchOnFloor', 'playHatchSound'],
				},
				{
					target: 'Splatting',
					actions: [log('should splat'), 'splatOnFloor', 'playSplatSound'],
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
				src: 'animationActor',
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
