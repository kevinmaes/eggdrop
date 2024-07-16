import { useSelector } from '@xstate/react';
import Konva from 'konva';
import { Ref, useEffect, useRef } from 'react';
import { Rect } from 'react-konva';
import { chefMachine } from './chef.machine';
import { ActorRefFrom } from 'xstate';
import { Position } from '../GameLevel/types';
import { AppActorContext } from '../app.machine';
import { gameLevelMachine } from '../GameLevel/gameLevel.machine';
// import useImage from 'use-image';

export type EggHitTestResult = 'caught' | 'broke-left' | 'broke-right' | 'none';

export function Chef({
	dimensions,
}: {
	dimensions: { width: number; height: number };
	layerRef: Ref<Konva.Layer>;
	initialPosition: Position;
}) {
	// const [chefImage] = useImage('path-to-your-chef-image.png');
	const appActorRef = AppActorContext.useActorRef();

	const gameLevelActorRef = appActorRef.system.get(
		'gameLevelMachine'
	) as ActorRefFrom<typeof gameLevelMachine>;
	const chefActorRef = appActorRef.system.get('chefMachine') as ActorRefFrom<
		typeof chefMachine
	>;

	const chefState = useSelector(chefActorRef, (state) => state);
	const chefPosition = useSelector(
		chefActorRef,
		(state) => state?.context.position ?? { x: 0, y: 0 }
	);

	const chefPotRef = useRef<Konva.Rect>(null);
	useEffect(() => {
		if (chefPotRef.current) {
			chefActorRef.send({ type: 'Set chefPotRef', chefPotRef });
		}
	}, [chefPotRef.current]);

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

	if (!chefState) {
		return null;
	}

	const color = chefState.matches('Catching') ? 'yellow' : 'silver';

	return (
		<>
			{/* Chef */}
			<Rect
				x={chefPosition.x}
				y={chefPosition.y}
				width={dimensions.width}
				height={dimensions.height}
				fill="gray"
			></Rect>
			{/* Pot */}
			<Rect
				ref={chefPotRef}
				x={chefPosition.x + 0.1 * dimensions.width}
				y={chefPosition.y + 0.4 * dimensions.height}
				width={dimensions.width * 0.8}
				height={dimensions.height * 0.5}
				fill={color}
			/>
			{/* Top side hit box (for catching eggs) */}
			<Rect
				ref={chefPotRimHitRef}
				x={chefPosition.x + 0.1 * dimensions.width}
				y={chefPosition.y + 0.4 * dimensions.height}
				width={dimensions.width * 0.8}
				height={10}
				fill="blue"
			/>
			{/* Left side hit box */}
			<Rect
				x={chefPosition.x}
				y={chefPosition.y + 0.4 * dimensions.height}
				width={10}
				height={dimensions.height * 0.5}
				fill="black"
			/>
			{/* Left side broken egg */}
			<Rect
				x={chefPosition.x}
				y={chefPosition.y + 0.4 * dimensions.height}
				width={5}
				height={dimensions.height * 0.5}
				// fill={
				// 	chefState?.context.hitTestResult === 'broke-left' ? 'white' : 'none'
				// }
			/>
			{/* Right side hit box */}
			<Rect
				x={chefPosition.x + dimensions.width - 10}
				y={chefPosition.y + 0.4 * dimensions.height}
				width={10}
				height={dimensions.height * 0.5}
				fill="black"
			/>
			{/* Right side broken egg */}
			<Rect
				x={chefPosition.x + dimensions.width - 5}
				y={chefPosition.y + 0.4 * dimensions.height}
				width={5}
				height={dimensions.height * 0.5}
				// fill={hitTestResult === 'broke-right' ? 'white' : 'none'}
			/>
		</>
	);

	// return (
	// 	<KonvaImage
	// 		image={chefImage}
	// 		x={state.context.position.x}
	// 		y={state.context.position.y}
	// 		width={50}
	// 		height={50}
	// 	/>
	// );
}
