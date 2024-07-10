import { useActor } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import { henMachine } from './hen.machine';
import { Animation } from 'konva/lib/Animation';
import { fromPromise } from 'xstate';
import henImageFile from '../assets/hen1.png';
import { Ref } from 'react';
import Konva from 'konva';
import { GameLevelActorContext } from '../GameLevel/gameLevel.machine';

interface HenProps {
	layerRef: Ref<Konva.Layer>;
	stageDimensions: { width: number; height: number };
	id: string;
	initialX: number;
	initialY: number;
	maxEggs: number;
	stoppedEggLayingRate: number;
	movingEggLayingRate: number;
}

export function Hen({
	layerRef,
	stageDimensions,
	id,
	maxEggs,
	initialX,
	initialY,
	stoppedEggLayingRate,
	movingEggLayingRate,
}: HenProps) {
	const gamelevelActorRef = GameLevelActorContext.useActorRef();

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
					gamelevelActorRef.send({
						type: 'Egg laid',
						henId: id,
						position: { x: state.context.position.x, y: 50 },
					});
				},
			},
		}),
		{
			input: {
				position: { x: initialX, y: initialY },
				stageDimensions,
				maxEggs,
				stoppedEggLayingRate,
				movingEggLayingRate,
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
