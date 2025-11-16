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
  id: 'Hen With Pauses',
  type: 'animated',
  title: 'Hen - With Pauses',
  description:
    'Back and forth movement with 1-2 second pauses - Visual story + headless inspector',
  actors: [
    {
      type: 'hen',
      machineVersion: 'with-pauses',
      componentVersion: 'with-pauses',
      id: 'hen-visual',
    },
    {
      type: 'hen',
      machineVersion: 'with-pauses-headless',
      componentVersion: 'with-pauses-headless',
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
