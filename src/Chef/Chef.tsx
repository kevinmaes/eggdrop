import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Ref, useEffect, useRef } from 'react';
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

	const { chefFrames, chefFrameNames, position, isCatchingEgg } = useSelector(
		chefActorRef,
		(state) => ({
			chefFrames: state.context.chefAssets.sprite.frames,
			chefFrameNames: Object.keys(state.context.chefAssets.sprite.frames),
			position: state.context.position,
			isCatchingEgg: state.context.isCatchingEgg,
		})
	);

	const chefRef = useRef<Konva.Image>(null);
	useEffect(() => {
		if (chefRef.current) {
			chefActorRef.send({ type: 'Set chefRef', chefRef });
		}
	}, [chefRef.current]);

	const chefPotRimHitRef = useRef<Konva.Rect>(null);
	useEffect(() => {
		if (chefPotRimHitRef.current) {
			gameLevelActorRef.send({
				type: 'Set chefPotRimHitRef',
				chefPotRimHitRef,
			});
		}
	}, [chefPotRimHitRef.current]);

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

	const frameIndex = isCatchingEgg ? 0 : 1;
	const currentFrame = chefFrames[chefFrameNames[frameIndex]].frame;
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
