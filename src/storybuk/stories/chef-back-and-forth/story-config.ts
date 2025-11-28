import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { ChefBackAndForth } from './chef-back-and-forth';
import { chefBackAndForthMachine } from './chef-back-and-forth.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  CHEF_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '20',
  type: 'animated',
  title: 'Chef - Moving',
  description:
    'Chef moves back and forth left to right - Visual story + headless inspector',
  actors: [
    {
      type: 'chef',
      machineVersion: 'back-and-forth',
      componentVersion: 'back-and-forth',
      startPosition: {
        x: getCenterX(
          canvasDimensions.canvasWidth,
          ACTOR_SIZE.chef.width,
          true
        ),
        y: 36,
      },
      id: 'chef-visual',
      machine: chefBackAndForthMachine,
      Component: ChefBackAndForth,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-bottom',
  statelyEmbedUrl: '',
  ...canvasDimensions,
};
