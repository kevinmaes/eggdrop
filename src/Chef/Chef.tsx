import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Ref, useEffect, useRef, useState } from 'react';
import { Rect } from 'react-konva';
import { chefMachine } from './chef.machine';
import { ActorRefFrom } from 'xstate';
import { Position } from '../GameLevel/types';
import { AppActorContext } from '../app.machine';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';
import { CHEF_POT_RIM_CONFIG } from '../GameLevel/gameConfig';
import useImage from 'use-image';
import { Image as KonvaImage } from 'react-konva';

export type EggHitTestResult = 'caught' | 'broke-left' | 'broke-right' | 'none';

export function Chef({
	dimensions,
}: {
	dimensions: { width: number; height: number };
	layerRef: Ref<Konva.Layer>;
	initialPosition: Position;
}) {
	const [image] = useImage('images/chef.sprite.png');
	const appActorRef = AppActorContext.useActorRef();

	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;
	const chefActorRef = appActorRef.system.get('chefMachine') as ActorRefFrom<
		typeof chefMachine
	>;

	const {
		chefFrames,
		chefFrameNames,
		position,
		isAnimateAsMoving,
		isCatchingEgg,
	} = useSelector(chefActorRef, (state) => ({
		chefFrames: state.context.chefAssets.sprite.frames,
		chefFrameNames: Object.keys(state.context.chefAssets.sprite.frames),
		position: state.context.position,
		// Use direction here instead of speed so that the chef's leg movement
		// stops as soon as the user releases the arrow key
		isAnimateAsMoving: state.context.direction !== 0,
		isCatchingEgg: state.context.isCatchingEgg,
	}));

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

	const currentFrame = chefFrames[chefFrameNames[finalFrameIndex]].frame;

	return (
		<>
			<KonvaImage
				ref={chefRef}
				image={image}
				x={position.x}
				y={position.y}
				width={dimensions.width}
				height={dimensions.height}
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
				x={position.x + CHEF_POT_RIM_CONFIG.xOffset}
				y={CHEF_POT_RIM_CONFIG.y}
				width={CHEF_POT_RIM_CONFIG.width}
				height={CHEF_POT_RIM_CONFIG.height}
				fill="transparent"
			/>
		</>
	);
}
