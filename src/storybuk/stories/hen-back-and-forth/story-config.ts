import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  type ActorConfig,
  HEN_STORY_CANVAS_HEIGHT_PERCENT,
} from '../../story-config-constants';

export const storyConfig: Omit<StoryConfig, 'actors'> & {
  actors: Omit<ActorConfig, 'startPosition'>[];
} = {
  id: 'Hen Back And Forth',
  type: 'animated',
  title: 'Hen - Back and Forth',
  description:
    'Visual story + headless inspector (for synchronized video recording)',
  actors: [
    {
      type: 'hen',
      machineVersion: 'back-and-forth',
      componentVersion: 'back-and-forth',
      id: 'hen-visual',
    },
    {
      type: 'hen',
      machineVersion: 'back-and-forth-headless',
      componentVersion: 'back-and-forth-headless',
      id: 'hen-headless',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl: '',
  ...calculateStoryCanvasDimensions(
    'vertical',
    HEN_STORY_CANVAS_HEIGHT_PERCENT
  ),
};
