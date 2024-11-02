import { useSelector } from '@xstate/react';
import { Image } from 'react-konva';

import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import type { ActorRefFrom } from 'xstate';
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';
import { AppActorContext } from '../app.machine';
import type { chefMachine } from '../Chef/chef.machine';

type ChickFrameName =
	| 'egg-broken-white.png'
	| 'egg-broken-black.png'
	| 'chick-hatch.png'
	| 'chick-forward-1.png'
	| 'chick-forward-2.png'
	| 'chick-run-left-1.png'
	| 'chick-run-left-2.png'
	| 'chick-run-right-1.png'
	| 'chick-run-right-2.png';

export function EggCaughtPoints({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const appActorRef = AppActorContext.useActorRef();
	const chefActorRef = appActorRef.system.get('chefMachine') as ActorRefFrom<
		typeof chefMachine
	>;
	const { chefPosition } = useSelector(chefActorRef, (state) => {
		if (!state) {
			return { movingDirection: 'none', lastMovingDirection: 'none' };
		}
		return {
			chefPosition: state.context.position,
		};
	});
	const eggState = useSelector(eggActorRef, (state) => state);

	const {
		gameConfig,
		// exitingDirection,
		showGoldPoints,
		// isHatching,
		// isHatchingJump,
		// isHatched,
		// isBroken,
		// isExiting,
		// isDone,
		// eggFrames,
		// chickFrames,
		uiFrames,
		// color,
	} = useSelector(eggActorRef, (state) => {
		// const isExiting = state.matches('Exiting');
		// // let exitingDirection: 'none' | 'left' | 'right' = 'none';
		// if (isExiting) {
		// 	if (state.context.targetPosition.x < state.context.position.x) {
		// 		exitingDirection = 'left';
		// 	} else {
		// 		exitingDirection = 'right';
		// 	}
		// }
		return {
			gameConfig: state.context.gameConfig,
			// isExiting,
			// exitingDirection,
			showGoldPoints: state.hasTag('gold points'),
			// isHatching: state.matches('Hatching'),
			// isHatchingJump: state.matches('Hatching Jump'),
			// isHatched: state.matches('Hatched'),
			// isBroken: state.matches('Splatting'),
			// isDone: state.matches('Done'),
			// eggFrames: state.context.eggAssets.frames,
			// eggFrameNames: Object.keys(state.context.eggAssets.frames),
			uiFrames: state.context.uiAssets.frames,
			// chickFrames: state.context.chickAssets.frames,
			// chickFrameNames: Object.keys(state.context.chickAssets.frames),
			// color: state.context.color,
		};
	});
	const pointsRef = useRef<Konva.Image>(null);

	// const [eggImage] = useImage('images/egg.sprite.png');
	// const [chickImage] = useImage('images/chick.sprite.png');
	const [uiImage] = useImage(`images/ui.sprite.png`);

	// const [currentChickFrameName, setCurrentChickFrameName] =
	// 	useState<ChickFrameName>('chick-forward-1.png');

	// useEffect(() => {
	// 	if (eggRef.current) {
	// 		eggActorRef.send({ type: 'Set eggRef', eggRef });
	// 	}
	// }, [eggRef.current]);

	// useEffect(() => {
	// 	let interval: ReturnType<typeof setInterval> | null = null;

	// 	switch (true) {
	// 		case isHatching: {
	// 			setCurrentChickFrameName('chick-hatch.png');
	// 			break;
	// 		}
	// 		case isHatchingJump: {
	// 			setCurrentChickFrameName('chick-forward-2.png');
	// 			break;
	// 		}
	// 		case isHatched: {
	// 			setCurrentChickFrameName('chick-forward-1.png');
	// 			break;
	// 		}
	// 		case isExiting && exitingDirection !== 'none': {
	// 			const chikRunFrame: ChickFrameName[] = [
	// 				`chick-run-${exitingDirection}-1.png`,
	// 				`chick-run-${exitingDirection}-2.png`,
	// 			];
	// 			setCurrentChickFrameName(chikRunFrame[0] as ChickFrameName);
	// 			interval = setInterval(() => {
	// 				setCurrentChickFrameName((prevFrameName) => {
	// 					const index = chikRunFrame.indexOf(prevFrameName);
	// 					if (index === -1 || index === chikRunFrame.length - 1) {
	// 						return chikRunFrame[0] as ChickFrameName;
	// 					}
	// 					return chikRunFrame[index + 1] as ChickFrameName;
	// 				});
	// 			}, 100);
	// 			break;
	// 		}
	// 		default:
	// 			break;
	// 	}

	// 	return () => {
	// 		if (interval) {
	// 			clearInterval(interval);
	// 		}
	// 	};
	// }, [isHatching, isHatchingJump, isHatched, isExiting, exitingDirection]);

	// if (isDone) {
	// 	return null;
	// }

	if (showGoldPoints) {
		const tenPointsFrame = uiFrames['10-points.png']?.frame;

		if (!tenPointsFrame || !chefPosition) {
			return null;
		}

		return (
			<Image
				ref={pointsRef}
				image={uiImage}
				width={60}
				height={60}
				rotation={0}
				// x={chefPosition.x}
				// y={chefPosition.y - 200}
				x={500}
				y={500}
				// offsetX={0.5 * gameConfig.egg.chick.width}
				// offsetX={
				// 	shouldFaceRight
				// 		? chefPotRimConfig.offsetX
				// 		: (0.5 * chefConfig.width) / 2 + chefPotRimConfig.offsetX
				// }
				crop={{
					x: tenPointsFrame.x,
					y: tenPointsFrame.y,
					width: tenPointsFrame.w,
					height: tenPointsFrame.h,
				}}
			/>
		);
	}

	return (
		<Image
			ref={eggRef}
			image={chickImage}
			width={60}
			height={60}
			rotation={0}
			x={eggState.context.position.x}
			y={gameConfig.stageDimensions.height - gameConfig.egg.chick.height}
			offsetX={0.5 * gameConfig.egg.chick.width}
			crop={{
				x: currentChickFrame.x,
				y: currentChickFrame.y,
				width: currentChickFrame.w,
				height: currentChickFrame.h,
			}}
		/>
	);
}
