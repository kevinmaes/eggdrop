import { useSelector } from '@xstate/react';
import {
	Circle,
	Rect,
	// Image as KonvaImage
} from 'react-konva';
// import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { ActorRefFrom } from 'xstate';
import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { STAGE_DIMENSIONS } from '../GameLevel/gameConfig';

export function Egg({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const eggState = useSelector(eggActorRef, (state) => state);
	const { position } = eggState.context;
	const eggRef = useRef<Konva.Circle>(null);

	useEffect(() => {
		if (eggRef.current) {
			eggRef.current.to({
				duration: 3,
				x: position.x,
				y: STAGE_DIMENSIONS.height - 20,
				onUpdate: () => {},
				onFinish: () => {
					eggActorRef.send({ type: 'Land on floor', result: 'Splat' });
				},
			});
		}
	}, [eggRef, position]);

	if (eggState.matches('Done')) {
		return null;
	}

	return eggState.matches('Hatching') ? (
		<Circle
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			radius={20}
			fill="yellow"
		/>
	) : eggState.matches('Exiting') ? (
		<Circle
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			radius={20}
			fill="yellow"
		/>
	) : eggState.matches('Splatting') ? (
		// Render a rectangle
		<Rect
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			width={40}
			height={3}
			fill="white"
		/>
	) : (
		<Circle
			ref={eggRef}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			radius={10}
			fill="white"
		/>
	);
}
