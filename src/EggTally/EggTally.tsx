import useImage from 'use-image';
import { AppActorContext } from '../app.machine';
import { Group, Image, Text } from 'react-konva';

export function EggTally({
	eggColor,
	eggSize = 30,
	count,
	x,
	y,
	width,
	height,
}: {
	eggColor: 'white' | 'gold';
	eggSize?: number;
	count: number;
	x: number;
	y: number;
	width?: number;
	height?: number;
}) {
	const eggFrames = AppActorContext.useSelector((state) => {
		return state?.context?.gameAssets?.egg?.frames ?? {};
	});
	const [eggImage] = useImage(`../images/egg.sprite.png`);

	if (!eggFrames) {
		return null;
	}

	const eggFrame = eggFrames[`egg-${eggColor}.png`].frame;

	return (
		<Group x={x} y={y} width={width} height={height}>
			<Image
				image={eggImage}
				width={eggSize}
				height={eggSize}
				border="5px solid red"
				shadowColor="black"
				shadowBlur={10}
				shadowOffset={{ x: 3, y: 3 }}
				shadowOpacity={0.5}
				crop={{
					x: eggFrame.x,
					y: eggFrame.y,
					width: eggFrame.w,
					height: eggFrame.h,
				}}
			/>
			<Text
				x={50}
				y={10}
				text={count.toLocaleString()}
				fontSize={20}
				fontStyle="bold"
				fontFamily="Arial"
				fill="black"
			/>
		</Group>
	);
}
