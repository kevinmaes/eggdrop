import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { ChefIdle } from './chef-idle';
import { chefIdleMachine } from './chef-idle.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  CHEF_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '19',
  type: 'static',
  title: 'Chef - Idle',
  description:
    'Stationary chef in idle state (simplest possible demo) - Visual story + headless inspector',
  actors: [
    {
      type: 'chef',
      machineVersion: 'idle',
      componentVersion: 'idle',
      startPosition: {
        x: getCenterX(
          canvasDimensions.canvasWidth,
          ACTOR_SIZE.chef.width,
          true
        ),
        y: 36,
      },
      id: 'chef-visual',
      machine: chefIdleMachine,
      Component: ChefIdle,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-bottom',
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?machineId=9170b692-617f-43d3-88c6-48510a3e95f8',
  ],
  ...canvasDimensions,
};
