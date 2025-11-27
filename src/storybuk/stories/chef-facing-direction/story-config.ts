import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { chefFacingDirectionMachine } from './chef-facing-direction.machine';
import { ChefFacingDirection } from './chef-facing-direction';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  CHEF_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '20',
  type: 'animated',
  title: 'Chef - Face Forward',
  description:
    'Chef moves back and forth and faces the correct direction - Visual demo',
  actors: [
    {
      type: 'chef',
      machineVersion: 'facing-direction',
      componentVersion: 'facing-direction',
      startPosition: {
        x: getCenterX(
          canvasDimensions.canvasWidth,
          ACTOR_SIZE.chef.width,
          true
        ),
        y: 36,
      },
      id: 'chef-visual',
      machine: chefFacingDirectionMachine,
      Component: ChefFacingDirection,
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
