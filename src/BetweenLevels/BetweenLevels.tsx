import { Layer, Text } from 'react-konva';
import { Button } from '../Button/Button';
import { AppActorContext } from '../app.machine';
import { useSelector } from '@xstate/react';

export function BetweenLevels() {
	const appActorRef = AppActorContext.useActorRef();
	const { gameScore, gameConfig } = useSelector(appActorRef, (state) => {
		return {
			gameScore: state.context.gameScore,
			gameConfig: state.context.gameConfig,
		};
	});

	return (
		<Layer>
			{/* Play button */}
			<Button
				x={gameConfig.stageDimensions.width / 2 - 150}
				y={gameConfig.stageDimensions.height / 2 - 50}
				width={300}
				height={100}
				text="Play next level"
				onClick={() => appActorRef.send({ type: 'Play' })}
			/>
			{/* Game score and other UI */}
			<Text
				x={10}
				y={300}
				text={`Score: ${gameScore}`}
				fontSize={30}
				fontFamily="Arial"
				fill="black"
			/>
		</Layer>
	);
}
