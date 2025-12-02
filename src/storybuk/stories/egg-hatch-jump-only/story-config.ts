import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  ACTOR_SIZE,
  getGroundY,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { EggHatchJumpOnly } from './egg-hatch-jump-only';
import { EggHatchJumpOnlyHeadless } from './egg-hatch-jump-only-headless';
import { eggHatchJumpOnlyHeadlessMachine } from './egg-hatch-jump-only-headless.machine';
import { eggHatchJumpOnlyMachine } from './egg-hatch-jump-only.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '16',
  type: 'animated',
  title: 'Egg - Hatch and Jump',
  description:
    'Demonstrates inserting jump: egg lands, hatches, JUMPS, then exits - Shows how jump animation fits between hatch and exit - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'hatch-jump-only',
      componentVersion: 'hatch-jump-only',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y:
          getGroundY(canvasDimensions.canvasHeight) -
          ACTOR_SIZE.egg.height +
          25,
      },
      id: 'egg-visual',
      machine: eggHatchJumpOnlyMachine,
      Component: EggHatchJumpOnly,
    },
    {
      type: 'egg',
      machineVersion: 'hatch-jump-only-headless',
      componentVersion: 'hatch-jump-only-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getGroundY(canvasDimensions.canvasHeight) - ACTOR_SIZE.egg.height,
      },
      id: 'egg-headless',
      machine: eggHatchJumpOnlyHeadlessMachine,
      Component: EggHatchJumpOnlyHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&colorMode=light&machineId=c35d5fb2-94b5-4d0d-94e3-20533065af3a',
  ],
  ...canvasDimensions,
};
