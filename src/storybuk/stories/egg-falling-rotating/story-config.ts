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
  id: 'Egg Falling Rotating',
  type: 'animated',
  title: 'Egg - Falling + Rotating',
  description:
    'Egg falls with gravity AND rotates continuously (like in the game) - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'falling-rotating',
      componentVersion: 'falling-rotating',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'falling-rotating-headless',
      componentVersion: 'falling-rotating-headless',
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
