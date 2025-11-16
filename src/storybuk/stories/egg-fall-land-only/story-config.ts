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
  id: 'Egg Fall Land Only',
  type: 'animated',
  title: 'Egg - Falling and Landing',
  description:
    'Incremental demo: egg falls with rotation and lands - Shows physics and landing detection - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'fall-land-only',
      componentVersion: 'fall-land-only',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'fall-land-only-headless',
      componentVersion: 'fall-land-only-headless',
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
