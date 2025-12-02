import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  HEN_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  getCenterY,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { HenEggLaying } from './hen-egg-laying';
import { henEggLayingMachine } from './hen-egg-laying.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  HEN_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '04',
  type: 'animated',
  title: 'Hen - Egg laying',
  description:
    'Stationary hen that transitions from idle to egg-laying state (showing backside)',
  actors: [
    {
      type: 'hen',
      machineVersion: 'egg-laying',
      componentVersion: 'egg-laying',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-egg-laying',
      machine: henEggLayingMachine,
      Component: HenEggLaying,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&machineId=914a58be-78fe-499c-8df0-9d4bf0da6104',
  ],
  ...canvasDimensions,
};
