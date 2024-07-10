import { Image as KonvaImage } from 'react-konva';
import useImage from 'use-image';
import henImageFile from '../assets/hen1.png';
import { GameLevelActorContext } from '../GameLevel/gameLevel.machine';
import { useSelector } from '@xstate/react';

export function Hen({ id }: { id: string }) {
	const henActorRef = GameLevelActorContext.useSelector((state) =>
		state.context.henActorRefs.find((henActorRef) => henActorRef.id === id)
	);
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
