import { Layer } from 'react-konva';
import { Button } from '../Button/Button';
import { AppActorContext } from '../app.machine';
import { useSelector } from '@xstate/react';
import { GameScoreBox } from '../GameScoreBox/GameScoreBox';

export function BetweenLevels() {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig } = useSelector(appActorRef, (state) => ({
		gameConfig: state.context.gameConfig,
	}));

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
			<GameScoreBox />
			{/* <Text
				x={10}
				y={300}
				text={`Score: ${gameScore}`}
				fontSize={30}
				fontFamily="Arial"
				fill="black"
			/> */}
		</Layer>
	);
}
