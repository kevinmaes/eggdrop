import { useActor } from '@xstate/react';
import Konva from 'konva';
import { Ref, useEffect } from 'react';
import { fromPromise } from 'xstate';
import { chefMachine } from './chef.machine';
import { Animation } from 'konva/lib/Animation';
import { Rect } from 'react-konva';
import { GameLevelActorContext } from '../GameLevel/gameLevel.machine';
// import useImage from 'use-image';

export type EggHitTestResult = 'caught' | 'broke-left' | 'broke-right' | 'none';

export function Chef({
	stageDimensions,
	dimensions,
	hitTestResult,
	layerRef,
	initialPosition,
	chefPotRimHitRef,
	chefPotLeftHitRef,
	chefPotRightHitRef,
}: {
	stageDimensions: { width: number; height: number };
	dimensions: { width: number; height: number };
	hitTestResult: EggHitTestResult;
	layerRef: Ref<Konva.Layer>;
	initialPosition: { x: number; y: number };
	chefPotRimHitRef: Ref<Konva.Rect>;
	chefPotLeftHitRef: Ref<Konva.Rect>;
	chefPotRightHitRef: Ref<Konva.Rect>;
}) {
	// const [chefImage] = useImage('path-to-your-chef-image.png');
	const gameLevelActorRef = GameLevelActorContext.useActorRef();

	const [state, send, chefActorRef] = useActor(
		chefMachine.provide({
			actors: {
				moveChef: fromPromise(() => {
					return new Promise((resolve) => {
						const anim = new Animation((frame) => {
							if (frame?.timeDiff) {
								resolve({ timeDiff: frame?.timeDiff });
							}
						}, layerRef);
						anim.start();
					});
				}),
			},
		}),
		{
			input: {
				position: initialPosition,
				speed: 0,
				speedLimit: 20,
				acceleration: 0.1 * 20,
				deceleration: 1,
				minXPos: 10,
				maxXPos: stageDimensions.width - dimensions.width - 10,
			},
		}
	);

	useEffect(() => {
		gameLevelActorRef.send({
			type: 'Set chefActorRef',
			chefActorRef,
		});
	}, [chefActorRef]);

	useEffect(() => {
		const handleKeyDown = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft') {
				send({ type: 'Set direction', direction: -1 });
			} else if (e.key === 'ArrowRight') {
				send({ type: 'Set direction', direction: 1 });
			}
		};
		const handleKeyUp = (e: KeyboardEvent) => {
			if (e.key === 'ArrowLeft' || e.key === 'ArrowRight') {
				send({ type: 'Set direction', direction: 0 });
			}
		};
		window.addEventListener('keydown', handleKeyDown);
		window.addEventListener('keyup', handleKeyUp);
		return () => {
			window.removeEventListener('keydown', handleKeyDown);
			window.removeEventListener('keyup', handleKeyUp);
		};
	}, []);

	const { position } = state.context;

	useEffect(() => {
		if (hitTestResult === 'caught') {
			send({ type: 'Catch' });
		}
		if (hitTestResult === 'broke-left') {
			send({ type: 'Broke', hitTestResult });
		}
		if (hitTestResult === 'broke-right') {
			send({ type: 'Broke', hitTestResult });
		}
	}, [hitTestResult]);

	const color = state.matches('Catching') ? 'yellow' : 'silver';

	return (
		<>
			{/* Chef */}
			<Rect
				x={position.x}
				y={position.y}
				width={dimensions.width}
				height={dimensions.height}
				fill="gray"
			></Rect>
			{/* Pot */}
			<Rect
				x={position.x + 0.1 * dimensions.width}
				y={position.y + 0.4 * dimensions.height}
				width={dimensions.width * 0.8}
				height={dimensions.height * 0.5}
				fill={color}
			/>
			{/* Top side hit box (for catching eggs) */}
			<Rect
				ref={chefPotRimHitRef}
				x={position.x + 0.1 * dimensions.width}
				y={position.y + 0.4 * dimensions.height}
				width={dimensions.width * 0.8}
				height={10}
				fill="blue"
			/>
			{/* Left side hit box */}
			<Rect
				ref={chefPotLeftHitRef}
				x={position.x}
				y={position.y + 0.4 * dimensions.height}
				width={10}
				height={dimensions.height * 0.5}
				fill="black"
			/>
			{/* Left side broken egg */}
			<Rect
				ref={chefPotLeftHitRef}
				x={position.x}
				y={position.y + 0.4 * dimensions.height}
				width={5}
				height={dimensions.height * 0.5}
				fill={state.context.hitTestResult === 'broke-left' ? 'white' : 'none'}
			/>
			{/* Right side hit box */}
			<Rect
				ref={chefPotRightHitRef}
				x={position.x + dimensions.width - 10}
				y={position.y + 0.4 * dimensions.height}
				width={10}
				height={dimensions.height * 0.5}
				fill="black"
			/>
			{/* Right side broken egg */}
			<Rect
				ref={chefPotRightHitRef}
				x={position.x + dimensions.width - 5}
				y={position.y + 0.4 * dimensions.height}
				width={5}
				height={dimensions.height * 0.5}
				fill={state.context.hitTestResult === 'broke-right' ? 'white' : 'none'}
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
