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
  id: 'Egg Hatch Jump Only',
  type: 'animated',
  title: 'Egg - Hatching with Jump (Inserted Animation)',
  description:
    'Demonstrates inserting jump: egg lands, hatches, JUMPS, then exits - Shows how jump animation fits between hatch and exit - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'hatch-jump-only',
      componentVersion: 'hatch-jump-only',
      id: 'egg-visual',
    },
    {
      type: 'egg',
      machineVersion: 'hatch-jump-only-headless',
      componentVersion: 'hatch-jump-only-headless',
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
