import { useSelector } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';

import eggImageFile from '../assets/egg.png';
import brokenEggFile from '../assets/broken-egg2.jpeg';
import runningChickImageFile from '../assets/running-chick.png';
import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { ActorRefFrom } from 'xstate';
import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { CHEF_DIMENSIONS, STAGE_DIMENSIONS } from '../GameLevel/gameConfig';
import { AppActorContext } from '../app.machine';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';

export function Egg({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const appActorRef = AppActorContext.useActorRef();
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;
	const eggState = useSelector(eggActorRef, (state) => state);
	const { id, position, targetPosition } = eggState.context;
	const eggRef = useRef<Konva.Image>(null);

	const [eggImage] = useImage(eggImageFile);
	const [brokenEggImage] = useImage(brokenEggFile);
	const [runningChickImage] = useImage(runningChickImageFile);

	useEffect(() => {
		if (eggRef.current) {
			if (eggState.matches('Falling')) {
				eggRef.current.to({
					duration: 3,
					y: targetPosition.y,
					rotation: -720,
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
						// Check that the egg wasn't already caught and terminated.
						if (eggRef.current) {
							eggActorRef.send({
								type: 'Land on floor',
								result: Math.random() < 0.5 ? 'Hatch' : 'Splat',
							});
						}
					},
				});
			}

			if (eggState.matches('Exiting')) {
				eggRef.current.to({
					duration: 1,
					x: targetPosition.x,
					easing: Konva.Easings.EaseIn,
					onFinish: () => {
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
		<KonvaImage
			ref={eggRef}
			image={runningChickImage}
			width={60}
			height={60}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
		/>
	) : eggState.matches('Exiting') ? (
		<KonvaImage
			ref={eggRef}
			image={runningChickImage}
			width={60}
			height={60}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
		/>
	) : eggState.matches('Splatting') ? (
		// Render a rectangle
		<KonvaImage
			// ref={eggRef}
			image={brokenEggImage}
			width={60}
			height={60}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
		/>
	) : (
		<KonvaImage
			ref={eggRef}
			image={eggImage}
			width={20}
			height={25}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			offsetX={10}
			offsetY={12.5}
		/>
	);
}
