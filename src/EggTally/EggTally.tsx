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
	eggColor: 'white' | 'gold' | 'black';
	eggSize?: number;
	count: number;
	x: number;
	y: number;
	width?: number;
	height?: number;
}) {
	const eggFrames = AppActorContext.useSelector(
		(state) => state?.context?.gameAssets?.egg?.frames ?? null
	);

	const [eggImage] = useImage(`../images/egg.sprite.png`);

	if (!eggFrames) {
		return null;
	}

	const eggFrame = eggFrames[`egg-${eggColor}.png`]?.frame;

	if (!eggFrame) {
		return null;
	}

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
				x={eggSize + 8}
				y={0.5 * eggSize - 10}
				text={count === 0 ? 'x' : count.toLocaleString()}
				fontSize={20}
				fontStyle="bold"
				fontFamily="Arco"
				fill="#666"
			/>
		</Group>
	);
}
