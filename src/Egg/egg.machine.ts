import { setup, assign, sendParent, AnyActorRef, log } from 'xstate';
import { Position } from '../GameLevel/types';
import { sounds } from '../sounds';
import Konva from 'konva';
import { CHEF_DIMENSIONS, STAGE_DIMENSIONS } from '../GameLevel/gameConfig';
import { animationActor } from './animation.machine';

export type EggResultStatus = null | 'Hatched' | 'Broken' | 'Caught';
export const eggMachine = setup({
	types: {} as {
		context: {
			parentRef: AnyActorRef;
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
		};
		events:
			| { type: 'Set eggRef'; eggRef: React.RefObject<Konva.Image> }
			| { type: 'Land on floor' }
			| { type: 'Catch' }
			| { type: 'Finished exiting' }
			| { type: 'Resume game' }
			| { type: 'Pause game' }
			| { type: 'Animation done' };

		input: {
			parentRef: AnyActorRef;
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
				console.log('yipee');
				sounds.yipee.play();
			}, 500);
		},
	},
}).createMachine({
	id: 'egg',
	initial: 'Idle',
	context: ({ input }) => ({
		parentRef: input.parentRef,
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
					target: 'FallingWithAnimation',
					actions: assign({
						eggRef: ({ event }) => event.eggRef,
					}),
				},
			},
		},
		FallingWithAnimation: {
			entry: 'setNewTargetPosition',
			on: {
				'Animation done': 'Landed',
				Catch: {
					target: 'Done',
					actions: assign({
						resultStatus: 'Caught',
					}),
				},
			},
			invoke: {
				src: 'animationActor',
				input: ({ context, self }) => ({
					id: context.id,
					ref: context.eggRef,
					parentRef: self,
					animationProps: {
						duration: 3,
						x: context.targetPosition.x,
						y: context.targetPosition.y,
						rotation: -720,
						onUpdate: () => {
							if (!context.eggRef.current) return;
							if (
								context.eggRef.current.y() >=
								STAGE_DIMENSIONS.height - CHEF_DIMENSIONS.height
							) {
								// console.log('Egg position updated should send to system');
								context.parentRef.send({
									type: 'Egg position updated',
									eggId: context.id,
									position: context.eggRef.current.getPosition(),
								});
							}
						},
						onFinish: () => {
							console.log('Egg done falling');
							self.send({ type: 'Animation done' });
						},
					},
				}),
				onDone: { target: 'Landed', actions: log('Going to Landed') },
			},
		},
		Landed: {
			always: [
				{
					guard: ({ context }) => Math.random() < context.hatchRate,
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
			on: {
				'Animation done': { target: 'Done' },
			},
			invoke: {
				src: 'animationActor',
				input: ({ context, self }) => ({
					id: context.id,
					ref: context.eggRef,
					parentRef: self,
					animationProps: {
						duration: 3,
						x: context.targetPosition.x,
						y: context.targetPosition.y,
						rotation: -720,
						onFinish: () => {
							console.log('Chick done existing');
							self.send({ type: 'Animation done' });
						},
					},
				}),
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
