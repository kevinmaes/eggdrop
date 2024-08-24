import { useSelector } from '@xstate/react';
import { Image as KonvaImage } from 'react-konva';

import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { ActorRefFrom } from 'xstate';
import Konva from 'konva';
import { useEffect, useRef, useState } from 'react';

// type EggFrameName = 'egg-white.png' | 'egg-gold.png' | 'egg-black.png';

type ChickFrameName =
	| 'egg-broken-white.png'
	| 'egg-broken-black.png'
	| 'chick-forward-1.png'
	| 'chick-run-left-1.png'
	| 'chick-run-left-2.png'
	| 'chick-run-right-1.png'
	| 'chick-run-right-2.png';

// type EggOrChickFrameName = EggFrameName | ChickFrameName;

export function Egg({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const eggState = useSelector(eggActorRef, (state) => state);

	const {
		gameConfig,
		isFacingLeft,
		isHatching,
		isBroken,
		isExiting,
		isDone,
		eggFrames,
		// eggFrameNames,
		chickFrames,
		// chickFrameNames,
		color,
	} = useSelector(eggActorRef, (state) => {
		return {
			gameConfig: state.context.gameConfig,
			isFacingLeft:
				state.hasTag('chick') &&
				state.context.targetPosition.x < state.context.position.x,
			isHatching: state.matches('Hatching'),
			isBroken: state.matches('Splatting'),
			isExiting: state.matches('Exiting'),
			isDone: state.matches('Done'),
			eggFrames: state.context.eggAssets.sprite.frames,
			eggFrameNames: Object.keys(state.context.eggAssets.sprite.frames),
			chickFrames: state.context.chickAssets.sprite.frames,
			chickFrameNames: Object.keys(state.context.chickAssets.sprite.frames),
			color: state.context.color,
		};
	});
	const eggRef = useRef<Konva.Image>(null);
	const [eggImage] = useImage(`../images/egg.sprite.png`);
	const [chickImage] = useImage(`../images/chick.sprite.png`);

	const [currentChickFrameName, setCurrentChickFrameName] =
		useState<ChickFrameName>('chick-forward-1.png');

	useEffect(() => {
		if (eggRef.current) {
			eggActorRef.send({ type: 'Set eggRef', eggRef });
		}
	}, [eggRef.current]);

	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;

		switch (true) {
			case isHatching: {
				setCurrentChickFrameName('chick-forward-1.png');
				break;
			}
			case isExiting && isFacingLeft: {
				const chickRunLeftFrameNames: ChickFrameName[] = [
					'chick-run-left-1.png',
					'chick-run-left-2.png',
				];
				setCurrentChickFrameName(chickRunLeftFrameNames[0]);
				interval = setInterval(() => {
					setCurrentChickFrameName((prevFrameName) => {
						const index = chickRunLeftFrameNames.indexOf(prevFrameName);
						if (index === -1 || index === chickRunLeftFrameNames.length - 1) {
							return chickRunLeftFrameNames[0];
						}
						return chickRunLeftFrameNames[index + 1];
					});
				}, 100);
				break;
			}
			default:
				break;
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isExiting]);

	if (isDone) {
		console.log('eggState.matches Done');
		return null;
	}

	if (isHatching) {
		const currentChickFrame = chickFrames[currentChickFrameName].frame;
		return (
			<KonvaImage
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

	if (isExiting) {
		const frameName = isFacingLeft
			? 'chick-run-left-1.png'
			: 'chick-run-right-1.png';
		const chickFrame = chickFrames[frameName].frame;
		return (
			<KonvaImage
				ref={eggRef}
				image={chickImage}
				width={60}
				height={60}
				rotation={0}
				x={eggState.context.position.x}
				y={gameConfig.stageDimensions.height - gameConfig.egg.chick.height}
				crop={{
					x: chickFrame.x,
					y: chickFrame.y,
					width: chickFrame.w,
					height: chickFrame.h,
				}}
			/>
		);
	}

	if (isBroken) {
		const brokenEggFrame = chickFrames[`egg-broken-${color}.png`].frame;
		return (
			<KonvaImage
				image={chickImage}
				width={gameConfig.egg.brokenEgg.width}
				height={gameConfig.egg.brokenEgg.height}
				x={eggState.context.position.x}
				y={gameConfig.stageDimensions.height - gameConfig.egg.brokenEgg.height}
				offsetY={0}
				// Always set rotation to 0 in case egg was rotating
				rotation={0}
				crop={{
					x: brokenEggFrame.x,
					y: brokenEggFrame.y,
					width: brokenEggFrame.w,
					height: brokenEggFrame.h,
				}}
			/>
		);
	}

	const currentEggFrame = eggFrames[`egg-${color}.png`].frame;
	return (
		<KonvaImage
			ref={eggRef}
			image={eggImage}
			width={30}
			height={30}
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			offsetX={15}
			offsetY={15}
			border="1px solid red"
			crop={{
				x: currentEggFrame.x,
				y: currentEggFrame.y,
				width: currentEggFrame.w,
				height: currentEggFrame.h,
			}}
		/>
	);
}
