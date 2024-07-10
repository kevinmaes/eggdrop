import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import henImageFile from '../assets/hen1.png';
import { useSelector } from '@xstate/react';
import { ActorRefFrom } from 'xstate';
import { henMachine } from './hen.machine';

export function Hen({
	henActorRef,
}: {
	henActorRef: ActorRefFrom<typeof henMachine>;
}) {
	// const henActorRef = GameLevelActorContext.useSelector((state) =>
	// 	state.context.henActorRefs.find((henActorRef) => henActorRef.id === id)
	// );
	const position = useSelector(henActorRef, (state) => state?.context.position);

	const [henImage] = useImage(henImageFile);

	if (!position) {
		return null;
	}

	return (
		<KonvaImage
			image={henImage}
			x={position.x}
			y={position.y}
			width={50}
			height={50}
		/>
	);
}
