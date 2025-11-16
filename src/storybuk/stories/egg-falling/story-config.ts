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
  id: 'Egg Falling',
  type: 'animated',
  title: 'Egg - Falling',
  description:
    'Egg falls straight down with gravity from top to bottom of screen - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'falling',
      componentVersion: 'falling',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'falling-headless',
      componentVersion: 'falling-headless',
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
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=67ee088f-7005-4919-a155-673965bfef40&mode=design',
};
