import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  getGroundY,
  ACTOR_SIZE,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { hatchedChickExitMachine } from './hatched-chick-exit.machine';
import { HatchedChickExit } from './hatched-chick-exit';
import { hatchedChickExitHeadlessMachine } from './hatched-chick-exit-headless.machine';
import { HatchedChickExitHeadless } from './hatched-chick-exit-headless';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '15',
  type: 'animated',
  title: 'Egg - Hatched Chick Exit',
  description:
    'Incremental demo: chick in shell transitions to running off - Shows exit animation without jump - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'hatched-chick-exit',
      componentVersion: 'hatched-chick-exit',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getGroundY(canvasDimensions.canvasHeight) - ACTOR_SIZE.egg.height,
      },
      id: 'egg-visual',
      machine: hatchedChickExitMachine,
      Component: HatchedChickExit,
    },
    {
      type: 'egg',
      machineVersion: 'hatched-chick-exit-headless',
      componentVersion: 'hatched-chick-exit-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y: getGroundY(canvasDimensions.canvasHeight) - ACTOR_SIZE.egg.height,
      },
      id: 'egg-headless',
      machine: hatchedChickExitHeadlessMachine,
      Component: HatchedChickExitHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  statelyEmbedUrl: '',
  ...canvasDimensions,
};
