import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { ChefFacingDirection } from './chef-facing-direction';
import { chefFacingDirectionMachine } from './chef-facing-direction.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  CHEF_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '21',
  type: 'animated',
  title: 'Chef - Pivot',
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
  showKeyboardIndicator: true,
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&colorMode=light&machineId=31f48035-ab2c-41cf-9329-9772674de001',
  ],
  ...canvasDimensions,
};
