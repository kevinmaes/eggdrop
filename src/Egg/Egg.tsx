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
import { Ref, useEffect } from 'react';
import Konva from 'konva';
import { Animation } from 'konva/lib/Animation';

interface EggProps {
	layerRef: Ref<Konva.Layer>;
	id: string;
	initialX: number;
	initialY: number;
	onUpdatePosition: (id: string, position: { x: number; y: number }) => void;
}

export function Egg({
	layerRef,
	id,
	initialX,
	initialY,
	onUpdatePosition,
}: EggProps) {
	const [state, send] = useActor(
		eggMachine.provide({
			actors: {
				fallEgg: fromPromise(() => {
					return new Promise((resolve) => {
						const anim = new Animation((frame) => {
							if (frame?.timeDiff) {
								resolve({ timeDiff: frame?.timeDiff });
								anim.stop();
							}
						}, layerRef);
						anim.start();
					});
				}),
				exitChick: fromPromise(() => {
					return new Promise((resolve) => {
						const anim = new Animation((frame) => {
							if (frame?.timeDiff) {
								resolve({ timeDiff: frame?.timeDiff });
								anim.stop();
							}
						}, layerRef);
						anim.start();
					});
				}),
			},
			actions: {
				notifyOfEggPosition: ({ context }) => {
					// console.log('notifyOfEggPosition');
					// Pass this egg's position up the component tree for hit detection
					onUpdatePosition(id, context.position);
				},
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

	useEffect(() => {
		setTimeout(() => {
			send({ type: 'Catch' });
		}, 5000);
	}, []);

	// const [eggImage] = useImage('path-to-your-egg-image.png');

	// useEffect(() => {
	// 	if (current.matches('splatted') || current.matches('caught')) {
	// 		onRemove(id);
	// 	}
	// }, [current, id, onRemove]);

	if (state.matches('Done')) {
		return null;
	}

	return state.matches('Caught') ? (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={10}
			fill="black"
		/>
	) : state.matches('Hatching') ? (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={20}
			fill="yellow"
		/>
	) : state.matches('Exiting') ? (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={20}
			fill="yellow"
		/>
	) : state.matches('Splatting') ? (
		// Render a rectangle
		<Rect
			x={state.context.position.x}
			y={state.context.position.y}
			width={40}
			height={3}
			fill="white"
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
