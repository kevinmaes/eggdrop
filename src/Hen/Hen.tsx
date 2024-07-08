import { useActor } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { henMachine } from './hen.machine';
import { Animation } from 'konva/lib/Animation';
import { fromPromise } from 'xstate';
import henImageFile from '../assets/hen1.png';
import { Ref } from 'react';
import Konva from 'konva';

interface HenProps {
	layerRef: Ref<Konva.Layer>;
	id: string;
	initialX: number;
	initialY: number;
	maxEggs: number;
	eggLayingRate: number;
	onLayEgg: (henId: string, x: number) => void;
}

export function Hen({
	layerRef,
	id,
	maxEggs,
	initialX,
	initialY,
	eggLayingRate,
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
								anim.stop();
							}
						}, layerRef);
						anim.start();
					});
				}),
			},
			actions: {
				layEgg: () => {
					return onLayEgg(id, state.context.position.x);
				},
			},
		}),
		{
			input: {
				position: { x: initialX, y: initialY },
				stageWidth: window.innerWidth,
				maxEggs,
				eggLayingRate,
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
