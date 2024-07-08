// import { useEffect } from 'react';
import { useActor } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { henMachine } from './hen.machine';
import { Animation } from 'konva/lib/Animation';
import { assign, fromPromise } from 'xstate';
import henImageFile from '../assets/hen1.png';
import { Ref } from 'react';
import Konva from 'konva';

interface HenProps {
	layerRef: Ref<Konva.Layer>;
	id: number;
	initialX: number;
	initialY: number;
	onLayEgg: (henId: number, x: number) => void;
}
export function Hen({ layerRef, id, initialX, initialY, onLayEgg }: HenProps) {
	const [state] = useActor(
		henMachine.provide({
			actors: {
				moveHen: fromPromise(() => {
					return new Promise((resolve) => {
						// console.log('inside promise');
						const anim = new Animation((frame) => {
							// console.log('inside animation frame');
							if (frame?.timeDiff) {
								resolve({ timeDiff: frame?.timeDiff });
							}
							// anim.stop();
						}, layerRef);
						anim.start();
					});
				}),
			},
			actions: {
				updatePosition: assign(({ context, event }) => {
					// Compare the context.position.x with context.targetPosition.x
					// and calulate the direction
					let newDirection = 1;
					if (context.position.x > context.targetPosition.x) {
						newDirection = -1;
					}
					// console.log('updatePosition', context.targetPosition.x, newDirection);

					let newX =
						context.position.x +
						newDirection * event.output.timeDiff * context.speed;

					if (newDirection === 1 && newX > context.targetPosition.x) {
						console.log('fixing position 1 direction');
						newX = context.targetPosition.x;
					}
					if (newDirection === -1 && newX < context.targetPosition.x) {
						console.log('fixing position -1 direction');
						newX = context.targetPosition.x;
					}

					return {
						position: { x: newX, y: context.position.y },
					};
				}),
				layEgg: () => {
					console.log('layEgg action called!');
					return onLayEgg(id, state.context.position.x);
				},
			},
		}),
		{
			input: {
				position: { x: initialX, y: initialY },
				stageWidth: window.innerWidth,
			},
		}
	);

	const { position } = state.context;
	const [henImage] = useImage(henImageFile);

	return (
		<KonvaImage
			image={henImage}
			x={position.x}
			y={position.y}
			width={50}
			height={50}
		/>
	);
}
