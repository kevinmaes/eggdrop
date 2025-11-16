import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  type ActorConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
} from '../../story-config-constants';

export const storyConfig: Omit<StoryConfig, 'actors'> & {
  actors: Omit<ActorConfig, 'startPosition'>[];
} = {
  id: 'Hatched Chick Exit',
  type: 'animated',
  title: 'Hatched Chick - Exit',
  description:
    'Incremental demo: chick in shell transitions to running off - Shows exit animation without jump - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'hatched-chick-exit',
      componentVersion: 'hatched-chick-exit',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'hatched-chick-exit-headless',
      componentVersion: 'hatched-chick-exit-headless',
      id: 'egg-headless',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  statelyEmbedUrl: '',
  ...calculateStoryCanvasDimensions(
    'horizontal',
    EGG_STORY_CANVAS_WIDTH_PERCENT
  ),
};
