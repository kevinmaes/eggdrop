import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
} from '../../story-config-constants';

export const storyConfig: StoryConfig = {
  id: '23',
  type: 'animated',
  title: 'Other - Egg Caught Points',
  description:
    'Points animation that appears when catching an egg - loops every 2 seconds',
  actors: [
    {
      type: 'egg-caught-points',
      machineVersion: 'demo',
      componentVersion: 'demo',
      startPosition: { x: 192, y: 640 }, // centerX, centerY + 100
      id: 'egg-caught-points-white',
      eggColor: 'white',
    },
    {
      type: 'egg-caught-points',
      machineVersion: 'demo',
      componentVersion: 'demo',
      startPosition: { x: 192, y: 440 }, // centerX, centerY - 100
      id: 'egg-caught-points-gold',
      eggColor: 'gold',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  statelyEmbedUrl: '',
  ...calculateStoryCanvasDimensions('horizontal', 20),
};
