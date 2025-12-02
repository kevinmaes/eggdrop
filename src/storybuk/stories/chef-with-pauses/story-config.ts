import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { ChefWithPauses } from './chef-with-pauses';
import { chefWithPausesMachine } from './chef-with-pauses.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  CHEF_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '22',
  type: 'animated',
  title: 'Chef - Move + Stop',
  description:
    'Chef moves with random pauses and faces direction of movement - Visual demo',
  actors: [
    {
      type: 'chef',
      machineVersion: 'with-pauses',
      componentVersion: 'with-pauses',
      startPosition: {
        x: getCenterX(
          canvasDimensions.canvasWidth,
          ACTOR_SIZE.chef.width,
          true
        ),
        y: 36,
      },
      id: 'chef-visual',
      machine: chefWithPausesMachine,
      Component: ChefWithPauses,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-bottom',
  showKeyboardIndicator: true,
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&colorMode=light&machineId=f7665539-747e-4617-8603-201df860b95d',
  ],
  ...canvasDimensions,
};
