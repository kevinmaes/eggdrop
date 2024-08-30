import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Ref, useEffect, useRef, useState } from 'react';
import { Rect } from 'react-konva';
import { chefMachine } from './chef.machine';
import { ActorRefFrom } from 'xstate';
import { AppActorContext } from '../app.machine';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';
import useImage from 'use-image';
import { Image } from 'react-konva';
import { SpriteData } from '../types/assets';

type ChefFrameName = 'chef-catch.png' | 'chef-leg-1.png' | 'chef-leg-2.png';
type ChefFrames = Record<ChefFrameName, SpriteData['frames'][string]>;

export function Chef({}: // dimensions,
{
	layerRef: Ref<Konva.Layer>;
}) {
	const [image] = useImage('images/chef.sprite.png');
	const appActorRef = AppActorContext.useActorRef();
	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;
	const chefActorRef = appActorRef.system.get('chefMachine') as ActorRefFrom<
		typeof chefMachine
	>;
	const { chefPotRimConfig } = AppActorContext.useSelector((state) => ({
		chefPotRimConfig: state.context.gameConfig.chef.potRim,
	}));

	const {
		chefConfig,
		chefFrames,
		chefFrameNames,
		position,
		isAnimateAsMoving,
		isCatchingEgg,
	} = useSelector(chefActorRef, (state) => {
		if (typeof state === 'undefined') {
			return {
				chefConfig: {
					width: 0,
					height: 0,
					x: 0,
					y: 0,
				},
				chefFrames: {} as ChefFrames,
				chefFrameNames: [],
				position: { x: 0, y: 0 },
				isAnimateAsMoving: false,
				isCatchingEgg: false,
			};
		}
		return {
			chefConfig: state.context.chefConfig,
			chefFrames: state.context.chefAssets.frames as ChefFrames,
			chefFrameNames: Object.keys(
				state.context.chefAssets.frames
			) as ChefFrameName[],
			position: state.context.position,
			// Use direction here instead of speed so that the chef's leg movement
			// stops as soon as the user releases the arrow key
			isAnimateAsMoving: state.context.direction !== 0,
			isCatchingEgg: state.context.isCatchingEgg,
		};
	});

	const [frameIndex, setFrameIndex] = useState(1);

	// Set the chefRef in the chef machine
	const chefRef = useRef<Konva.Image>(null);
	useEffect(() => {
		if (chefRef.current) {
			chefActorRef.send({ type: 'Set chefRef', chefRef });
		}
	}, [chefRef.current]);

	// Set the chefPotRimHitRef in the gameLevel machine
	const chefPotRimHitRef = useRef<Konva.Rect>(null);
	useEffect(() => {
		if (chefPotRimHitRef.current) {
			gameLevelActorRef.send({
				type: 'Set chefPotRimHitRef',
				chefPotRimHitRef,
			});
		}
	}, [chefPotRimHitRef.current]);

	// Animate the chef's leg movement when the chef is moving
	useEffect(() => {
		let interval: ReturnType<typeof setInterval> | null = null;

		if (isAnimateAsMoving && !isCatchingEgg) {
			// Change frameIndex immediately so if the chef only moves
			// a tiny bit so we still see leg movement
			setFrameIndex((prevIndex) => (prevIndex === 1 ? 2 : 1));

			interval = setInterval(() => {
				setFrameIndex((prevIndex) => (prevIndex === 1 ? 2 : 1));
			}, 150);
		} else {
			setFrameIndex(1);
		}

		return () => {
			if (interval) {
				clearInterval(interval);
			}
		};
	}, [isAnimateAsMoving, isCatchingEgg]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				chefActorRef?.send({ type: 'Set direction', direction: -1 });
			} else if (e.key === 'ArrowRight') {
				chefActorRef?.send({ type: 'Set direction', direction: 1 });
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				chefActorRef?.send({ type: 'Set direction', direction: 0 });
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, [chefActorRef]);

	// Override frameIndex to 0 if isCatchingEgg is true
	const finalFrameIndex = isCatchingEgg ? 0 : frameIndex;
	const frameName = chefFrameNames[finalFrameIndex];
	const currentFrame = chefFrames[frameName]?.frame;
	if (!currentFrame) {
		return null;
	}

	return (
		<>
			<Image
				ref={chefRef}
				image={image}
				x={position.x}
				y={position.y}
				width={chefConfig.width}
				height={chefConfig.height}
				crop={{
					x: currentFrame.x,
					y: currentFrame.y,
					width: currentFrame.w,
					height: currentFrame.h,
				}}
			/>
			{/* Chef pot rim hit box (for catching eggs) */}
			<Rect
				ref={chefPotRimHitRef}
				x={position.x + chefPotRimConfig.xOffset}
				y={chefPotRimConfig.y}
				width={chefPotRimConfig.width}
				height={chefPotRimConfig.height}
				fill="transparent"
			/>
		</>
	);
}
