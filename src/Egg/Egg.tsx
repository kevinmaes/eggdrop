import { useSelector } from '@xstate/react';
import {
	Circle,
	Rect,
	// Image as KonvaImage
} from 'react-konva';
// import useImage from 'use-image';
import { eggMachine } from './egg.machine';
import { ActorRefFrom } from 'xstate';

export function Egg({
	eggActorRef,
}: {
	eggActorRef: ActorRefFrom<typeof eggMachine>;
}) {
	const eggState = useSelector(eggActorRef, (state) => state);

	if (eggState.matches('Done')) {
		return null;
	}

	console.log('eggState', eggState.context.position);

	return eggState.matches('Caught') ? (
		<Circle
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			radius={10}
			fill="black"
		/>
	) : eggState.matches('Hatching') ? (
		<Circle
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			radius={20}
			fill="yellow"
		/>
	) : eggState.matches('Exiting') ? (
		<Circle
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			radius={20}
			fill="yellow"
		/>
	) : eggState.matches('Splatting') ? (
		// Render a rectangle
		<Rect
			x={eggState.context.position.x}
			y={eggState.context.position.y}
			width={40}
			height={3}
			fill="white"
		/>
	) : (
		<Circle
			x={eggState.context.position.x}
			y={eggState.context.position.y}
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
