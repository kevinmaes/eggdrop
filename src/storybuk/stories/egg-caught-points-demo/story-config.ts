import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { EggCaughtPointsDemo } from './egg-caught-points-demo';
import { eggCaughtPointsDemoMachine } from './egg-caught-points-demo.machine';

export const storyConfig: StoryConfig = {
  id: '25',
  type: 'animated',
  title: 'Other - Egg Caught Points',
  description:
    'Points animation alternating between +1 and +10 - loops every 2 seconds',
  actors: [
    {
      type: 'egg-caught-points',
      machineVersion: 'demo',
      componentVersion: 'demo',
      startPosition: { x: 192, y: 540 }, // centerX, centerY
      id: 'egg-caught-points-alternating',
      eggColor: 'white', // Starts with white, will alternate
      machine: eggCaughtPointsDemoMachine,
      Component: EggCaughtPointsDemo,
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
