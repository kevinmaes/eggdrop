import { useActor } from '@xstate/react';
import {
	Circle,
	Rect,
	// Image as KonvaImage
} from 'react-konva';
// import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { Ref } from 'react';
import Konva from 'konva';
import { GameLevelActorContext } from '../GameLevel/gameLevel.machine';

interface EggProps {
	layerRef: Ref<Konva.Layer>;
	// floorY: number;
	id: string;
	initialX: number;
	initialY: number;
}

export function Egg({
	// floorY,
	id,
	initialX,
	initialY,
}: EggProps) {
	const gameLevelActorRef = GameLevelActorContext.useActorRef();

	const [state] = useActor(
		eggMachine.provide({
			actions: {
				notifyOfEggPosition: ({ context }) => {
					gameLevelActorRef.send({
						type: 'Egg position updated',
						eggId: id,
						position: context.position,
					});
				},
				eggDone: () => {
					gameLevelActorRef.send({ type: 'Remove egg', eggId: id });
				},
			},
		}),
		{
			input: {
				id,
				position: { x: initialX, y: initialY },
				fallingSpeed: 2,
				// TODO remove this.
				floorY: 0,
			},
		}
	);

	if (state.matches('Done')) {
		return null;
	}

	return state.matches('Caught') ? (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={10}
			fill="black"
		/>
	) : state.matches('Hatching') ? (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={20}
			fill="yellow"
		/>
	) : state.matches('Exiting') ? (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={20}
			fill="yellow"
		/>
	) : state.matches('Splatting') ? (
		// Render a rectangle
		<Rect
			x={state.context.position.x}
			y={state.context.position.y}
			width={40}
			height={3}
			fill="white"
		/>
	) : (
		<Circle
			x={state.context.position.x}
			y={state.context.position.y}
			radius={10}
			fill="white"
		/>
	);

	// return (
	// 	<KonvaImage
	// 		image={eggImage}
	// 		x={current.context.position.x}
	// 		y={current.context.position.y}
	// 		width={20}
	// 		height={20}
	// 	/>
	// );
}
