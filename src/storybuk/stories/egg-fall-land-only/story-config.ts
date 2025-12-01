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
import { EggFallLandOnly } from './egg-fall-land-only';
import { EggFallLandOnlyHeadless } from './egg-fall-land-only-headless';
import { eggFallLandOnlyHeadlessMachine } from './egg-fall-land-only-headless.machine';
import { eggFallLandOnlyMachine } from './egg-fall-land-only.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '11',
  type: 'animated',
  title: 'Egg - Falling + Landing',
  description:
    'Incremental demo: egg falls with rotation and lands - Shows physics and landing detection - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'fall-land-only',
      componentVersion: 'fall-land-only',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-visual',
      machine: eggFallLandOnlyMachine,
      Component: EggFallLandOnly,
    },
    {
      type: 'egg',
      machineVersion: 'fall-land-only-headless',
      componentVersion: 'fall-land-only-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getFallingStartY(canvasDimensions.canvasHeight),
      },
      id: 'egg-headless',
      machine: eggFallLandOnlyHeadlessMachine,
      Component: EggFallLandOnlyHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  statelyEmbedUrl:
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&machineId=8841e748-63ed-4ca8-b99d-10b051da7d0d',
  ...canvasDimensions,
};
