// import { useEffect, useRef } from 'react';
import { useActor } from '@xstate/react';
import {
	Circle,
	Rect,
	// Image as KonvaImage
} from 'react-konva';
// import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { fromPromise } from 'xstate';
import { Ref } from 'react';
import Konva from 'konva';
import { Animation } from 'konva/lib/Animation';
// import { Animation } from 'konva/lib/Animation';

interface EggProps {
	layerRef: Ref<Konva.Layer>;
	id: number;
	initialX: number;
	initialY: number;
	// chefPosition: { x: number; y: number };
	// onRemove: (id: number) => void;
	// onUpdatePosition: (id: number, timeDiff: number) => void;
	// onCollision: (id: number, type: 'floor' | 'chef') => void;
}

export function Egg({
	layerRef,
	id,
	initialX,
	initialY,
}: // chefPosition,
// onRemove,
EggProps) {
	const [state] = useActor(
		eggMachine.provide({
			actors: {
				fallEgg: fromPromise(() => {
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
				exitChick: fromPromise(() => {
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
		}),
		{
			input: {
				id,
				position: { x: initialX, y: initialY },
				fallingSpeed: 2,
			},
		}
	);
	// const [eggImage] = useImage('path-to-your-egg-image.png');

	// useEffect(() => {
	// 	if (current.matches('splatted') || current.matches('caught')) {
	// 		onRemove(id);
	// 	}
	// }, [current, id, onRemove]);

	if (state.matches('Done')) {
		return null;
	}

	return state.matches('Hatching') ? (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={20}
			fill="brown"
		/>
	) : state.matches('Exiting') ? (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={20}
			fill="brown"
		/>
	) : state.matches('Splatting') ? (
		// Render a rectangle
		<Rect
			x={state.context.position.x}
			y={state.context.position.y}
			width={20}
			height={5}
			fill="black"
		/>
	) : (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={10}
			fill="white"
		/>
	);

	// return (
	// 	<KonvaImage
	// 		image={eggImage}
	// 		x={current.context.position.x}
	// 		y={current.context.position.y}
	// 		width={20}
	// 		height={20}
	// 	/>
	// );
}
