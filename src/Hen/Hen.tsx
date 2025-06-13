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
import { STAGE_WIDTH } from '../constants';

interface HenProps {
	layerRef: Ref<Konva.Layer>;
	id: string;
	initialX: number;
	initialY: number;
	maxEggs: number;
	onLayEgg: (henId: string, x: number) => void;
}

export function Hen({
	layerRef,
	id,
	maxEggs,
	initialX,
	initialY,
	onLayEgg,
}: HenProps) {
	const [state] = useActor(
		henMachine.provide({
			actors: {
				moveHen: fromPromise(() => {
					return new Promise((resolve) => {
						const anim = new Animation((frame) => {
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
					let direction = 1;
					if (context.position.x > context.targetPosition.x) {
						direction = -1;
					}

					let newX =
						context.position.x +
						direction * event.output.timeDiff * context.speed;

					if (direction === 1 && newX > context.targetPosition.x) {
						newX = context.targetPosition.x;
					}
					if (direction === -1 && newX < context.targetPosition.x) {
						newX = context.targetPosition.x;
					}

					return {
						position: { x: newX, y: context.position.y },
					};
				}),
				layEgg: () => {
					return onLayEgg(id, state.context.position.x);
				},
			},
		}),
		{
			input: {
				position: { x: initialX, y: initialY },
				stageWidth: STAGE_WIDTH,
				maxEggs,
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
