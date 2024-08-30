import useImage from 'use-image';
import { AppActorContext } from '../app.machine';
import { Group, Image, Rect } from 'react-konva';

export function IntroImage() {
	const { gameConfig, showGameIntro } = AppActorContext.useSelector(
		(state) => ({
			gameConfig: state.context.gameConfig,
			showGameIntro: state.matches('Intro'),
		})
	);

	const [titleImage] = useImage('images/egg-drop-title-0.png');

	if (!showGameIntro) {
		return null;
	}
	return (
		<Group
			x={0.5 * gameConfig.stageDimensions.width - 500}
			y={0.5 * gameConfig.stageDimensions.height - 250}
		>
			<Rect
				width={1000}
				height={500}
				borderRadius={60}
				stroke="#fceb50"
				strokeWidth={10}
				cornerRadius={20}
			/>
			<Rect
				width={980}
				height={480}
				x={10}
				y={10}
				borderRadius={60}
				fill="#222d57"
				opacity={0.5}
				cornerRadius={20}
			/>
			<Image image={titleImage} width={900} height={405} x={50} y={47} />
		</Group>
	);
}
