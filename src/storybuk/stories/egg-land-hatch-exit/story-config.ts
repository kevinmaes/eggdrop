import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  getFallingStartY,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { EggLandHatchExit } from './egg-land-hatch-exit';
import { eggLandHatchExitMachine } from './egg-land-hatch-exit.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '15',
  type: 'animated',
  title: 'Egg - Land, Hatch, + Exit',
  description:
    'Complete sequence: egg falls and lands, hatches to show chick, chick runs off screen - No jump animation',
  actors: [
    {
      type: 'egg',
      machineVersion: 'land-hatch-exit',
      componentVersion: 'land-hatch-exit',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-land-hatch-exit',
      machine: eggLandHatchExitMachine,
      Component: EggLandHatchExit,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&colorMode=light&machineId=107879ce-77b1-4b87-a0f1-c4a573c85cab',
  ],
  ...canvasDimensions,
};
