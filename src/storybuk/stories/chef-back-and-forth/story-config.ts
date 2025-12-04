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
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
  'bottom'
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
  showKeyboardIndicator: true,
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&colorMode=light&machineId=31f48035-ab2c-41cf-9329-9772674de001',
  ],
  ...canvasDimensions,
};
