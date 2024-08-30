import { Layer } from 'react-konva';
import { AppActorContext } from '../app.machine';
import { useSelector } from '@xstate/react';
import { GameScoreBox } from '../GameScoreBox/GameScoreBox';

export function BetweenLevelsLayer() {
	const appActorRef = AppActorContext.useActorRef();
	const { gameConfig, isBetweenLevels } = useSelector(appActorRef, (state) => ({
		gameConfig: state.context.gameConfig,
		isBetweenLevels: state.hasTag('between levels'),
	}));

	if (!isBetweenLevels) {
		return null;
	}

	const groupWidth = 300;
	const groupHeight = 320;
	const xPos = gameConfig.stageDimensions.midX - 0.5 * groupWidth;
	const yPos = gameConfig.stageDimensions.midY - 0.5 * groupHeight;

	return (
		<Layer>
			<GameScoreBox x={xPos} y={yPos} width={groupWidth} height={groupHeight} />
		</Layer>
	);
}
