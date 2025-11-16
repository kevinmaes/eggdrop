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
  id: 'EggIdle',
  type: 'static',
  title: 'Egg - Idle',
  description: 'Shows a stationary egg for reference',
  actors: [
    {
      type: 'egg',
      machineVersion: 'idle',
      componentVersion: 'idle',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'idle-headless',
      componentVersion: 'idle-headless',
      id: 'egg-headless',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  ...calculateStoryCanvasDimensions(
    'horizontal',
    EGG_STORY_CANVAS_WIDTH_PERCENT
  ),
  statelyEmbedUrl:
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=egg-idle&mode=design',
};
