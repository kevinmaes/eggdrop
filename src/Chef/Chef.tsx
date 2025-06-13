import { useActor } from '@xstate/react';
import Konva from 'konva';
import { Ref, useEffect } from 'react';
import { assign, fromPromise } from 'xstate';
import { chefMachine } from './chef.machine';
import { Animation } from 'konva/lib/Animation';
import { Rect } from 'react-konva';
import { STAGE_WIDTH } from '../constants';
// import useImage from 'use-image';

export function Chef({
	caughtAnEgg,
	layerRef,
	initialPosition,
	onXPositionUpdate,
}: {
	caughtAnEgg: boolean;
	layerRef: Ref<Konva.Layer>;
	initialPosition: { x: number; y: number };
	onXPositionUpdate: (position: { x: number; y: number }) => void;
}) {
	// const [chefImage] = useImage('path-to-your-chef-image.png');

	const leftXLimit = 0;
	const rightXLimit = STAGE_WIDTH - 75;

	const [state, send] = useActor(
		chefMachine.provide({
			actors: {
				moveChef: fromPromise(() => {
					return new Promise((resolve) => {
						const anim = new Animation((frame) => {
							if (frame?.timeDiff) {
								resolve({ timeDiff: frame?.timeDiff });
							}
						}, layerRef);
						anim.start();
					});
				}),
			},
			actions: {
				updateChefPosition: assign(({ context }) => {
					const {
						speed,
						speedLimit,
						position,
						direction,
						acceleration,
						deceleration,
					} = context;
					let newSpeed = speed;
					let newXPos = position.x;

					if (direction === 0) {
						if (speed > 0) {
							newSpeed = Math.max(speed - deceleration, 0);
							if (newSpeed > speedLimit) {
								newSpeed = speedLimit;
							}
						} else if (speed < 0) {
							newSpeed = Math.min(speed + deceleration, 0);
							if (Math.abs(newSpeed) > speedLimit) {
								newSpeed = -speedLimit;
							}
						}
					} else {
						if (direction) {
							newSpeed = speed + direction * acceleration;
						}
					}

					newXPos = context.position.x + newSpeed;

					if (newXPos < leftXLimit) {
						newXPos = leftXLimit;
						newSpeed = 0;
					} else if (newXPos > rightXLimit) {
						newXPos = rightXLimit;
						newSpeed = 0;
					}

					// Update the outside world
					onXPositionUpdate({ x: newXPos, y: position.y });

					return {
						speed: newSpeed,
						position: { x: newXPos, y: position.y },
					};
				}),
			},
		}),
		{
			input: {
				position: initialPosition,
				speed: 0,
				speedLimit: 20,
				acceleration: 0.1 * 20,
				deceleration: 1,
			},
		}
	);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				send({ type: 'Set direction', direction: -1 });
			} else if (e.key === 'ArrowRight') {
				send({ type: 'Set direction', direction: 1 });
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				send({ type: 'Set direction', direction: 0 });
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	const { position } = state.context;

	useEffect(() => {
		if (caughtAnEgg) {
			send({ type: 'Catch' });
		}
	}, [caughtAnEgg]);

	const color = state.matches('Catching') ? 'gray' : 'green';
	// Render a square for now
	return (
		<Rect x={position.x} y={position.y} width={75} height={100} fill={color} />
	);

	// return (
	// 	<KonvaImage
	// 		image={chefImage}
	// 		x={state.context.position.x}
	// 		y={state.context.position.y}
	// 		width={50}
	// 		height={50}
	// 	/>
	// );
}
