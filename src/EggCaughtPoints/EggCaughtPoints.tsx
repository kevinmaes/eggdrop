import { useSelector } from '@xstate/react';
import { Image } from 'react-konva';

import useImage from 'use-image';
import type { ActorRefFrom } from 'xstate';
import Konva from 'konva';
import { useEffect, useRef } from 'react';
import { AppActorContext } from '../app.machine';
import type { gameLevelMachine } from '../GameLevel/gameLevel.machine';
import type { eggCaughtPointsActor } from './eggCaughtPoints.actor';

export function EggCaughtPoints({
	eggCaughtPointsActorRefs,
}: {
	eggCaughtPointsActorRefs: ActorRefFrom<typeof eggCaughtPointsActor>;
}) {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig } = AppActorContext.useSelector((state) => {
		return {
			gameConfig: state.context.gameConfig,
		};
	});
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;
	const { uiFrames } = useSelector(gameLevelActorRef, (state) => {
		return {
			uiFrames: state.context.gameAssets.ui.frames,
		};
	});

	const { position, eggColor } = useSelector(
		eggCaughtPointsActorRefs,
		(state) => {
			if (!state) {
				return { position: { x: 0, y: 0 } };
			}
			return {
				position: state.context.position,
				eggColor: state.context.eggColor,
			};
		}
	);

	const eggCaughtPointsRef = useRef<Konva.Image>(null);
	useEffect(() => {
		if (!eggCaughtPointsRef.current) {
			return;
		}
		eggCaughtPointsActorRefs.send({
			type: 'Set egg caught points ref',
			eggCaughtPointsRef: eggCaughtPointsRef,
		});
	}, [eggCaughtPointsRef]);

	const [uiImage] = useImage('images/ui.sprite.png');

	const imageKey = eggColor === 'gold' ? '10-points.png' : '1-point.png';
	const currentFrame = uiFrames[imageKey]?.frame;

	if (!currentFrame) {
		return null;
	}
	return (
		<Image
			ref={eggCaughtPointsRef}
			image={uiImage}
			x={position.x}
			y={position.y - 20}
			offsetX={0.5 * gameConfig.eggCaughtPoints.width}
			width={50}
			height={50}
			crop={{
				x: currentFrame.x,
				y: currentFrame.y,
				width: currentFrame.w,
				height: currentFrame.h,
			}}
			rotation={0}
		/>
	);
}
