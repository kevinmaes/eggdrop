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
  id: 'Egg Hatch Game Accurate',
  type: 'animated',
  title: 'Egg - Complete Hatching (Game-Accurate)',
  description:
    'Full sequence matching real game: falls, hatches (300ms), jumps and bounces, pauses (500ms), runs off - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'hatch-game-accurate',
      componentVersion: 'hatch-game-accurate',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'hatch-game-accurate-headless',
      componentVersion: 'hatch-game-accurate-headless',
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
