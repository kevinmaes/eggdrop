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
  id: 'Egg Splat',
  type: 'animated',
  title: 'Egg - Splat',
  description:
    'Egg falls and splats on the ground, showing broken egg sprite - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'splat',
      componentVersion: 'splat',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'splat-headless',
      componentVersion: 'splat-headless',
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
