// import { useEffect } from 'react';
import { useActor } from '@xstate/react';
import { Image as KonvaImage, Layer } from 'react-konva';
import useImage from 'use-image';
import { henMachine } from './hen.machine';
import { Animation } from 'konva/lib/Animation';
import { fromPromise } from 'xstate';
import henImageFile from '../assets/hen1.png';

interface HenProps {
	layerRef: React.LegacyRef<typeof Layer>;
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
							resolve({ timeDiff: frame?.timeDiff });
							// anim.stop();
						}, layerRef);
						anim.start();
					});
				}),
			},
			actions: {
				layEgg: () => {
					console.log('layEgg action called!');
					return onLayEgg(id, state.context.position.x);
				},
			},
		}),
		{
			input: {
				position: { x: initialX, y: initialY },
				direction: 1,
			},
		}
	);

	const { position } = state.context;
	const [henImage] = useImage(henImageFile);
	// const layerRef = useRef();

	// useEffect(() => {
	// 	const anim = new Animation((frame) => {
	// 		send({ type: 'UPDATE_POSITION', timeDiff: frame?.timeDiff });
	// 	}, layerRef);

	// 	anim.start();

	// 	return () => {
	// 		anim.stop();
	// 	};
	// }, [send]);

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
