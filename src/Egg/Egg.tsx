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
import { CHEF_DIMENSIONS, STAGE_DIMENSIONS } from '../GameLevel/gameConfig';
import { GameLevelActorContext } from '../GameLevel/gameLevel.machine';

export function Egg({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const gameLevelActorRef = GameLevelActorContext.useActorRef();
	const eggState = useSelector(eggActorRef, (state) => state);
	const { id, position, targetPosition } = eggState.context;
	const eggRef = useRef<Konva.Circle>(null);

	useEffect(() => {
		if (eggRef.current) {
			if (eggState.matches('Falling')) {
				eggRef.current.to({
					duration: 3,
					y: targetPosition.y,
					onUpdate: function () {
						if (!eggRef.current) return;
						const updatedPosition = eggRef.current?.getPosition();

						if (
							updatedPosition.y >=
							STAGE_DIMENSIONS.height - CHEF_DIMENSIONS.height
						) {
							gameLevelActorRef.send({
								type: 'Egg position updated',
								eggId: id,
								position: updatedPosition,
							});
						}
					},
					onFinish: () => {
						eggActorRef.send({
							type: 'Land on floor',
							result: Math.random() < 0.5 ? 'Hatch' : 'Splat',
						});
					},
				});
			}

			if (eggState.matches('Exiting')) {
				eggRef.current.to({
					duration: 1,
					x: targetPosition.x,
					easing: Konva.Easings.EaseIn,
					onFinish: () => {
						console.log('onFinish state.value', eggState.value);
						eggActorRef.send({
							type: 'Finished exiting',
						});
					},
				});
			}
		}
	}, [eggRef, position, targetPosition]);

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
			ref={eggRef}
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
