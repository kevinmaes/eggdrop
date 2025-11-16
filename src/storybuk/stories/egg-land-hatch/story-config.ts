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
  id: 'Egg Land Hatch',
  type: 'animated',
  title: 'Egg - Land and Hatch',
  description:
    'Incremental demo: egg falls and lands, shows chick in shell - Basic hatch transition without jump - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'land-hatch',
      componentVersion: 'land-hatch',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'land-hatch-headless',
      componentVersion: 'land-hatch-headless',
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
