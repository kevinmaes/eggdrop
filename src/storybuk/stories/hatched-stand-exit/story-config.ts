import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  getGroundY,
  ACTOR_SIZE,
} from '../../story-config-constants';

import { HatchedStandExit } from './hatched-stand-exit';
import { HatchedStandExitHeadless } from './hatched-stand-exit-headless';
import { hatchedStandExitHeadlessMachine } from './hatched-stand-exit-headless.machine';
import { hatchedStandExitMachine } from './hatched-stand-exit.machine';

const canvasDimensions = calculateStoryCanvasDimensions(
  'horizontal',
  EGG_STORY_CANVAS_WIDTH_PERCENT
);

export const storyConfig: StoryConfig = {
  id: '14',
  type: 'animated',
  title: 'Egg - Hatched, Stand, Exit',
  description:
    'Chick sequence: starts hatched in shell on ground → standing alone → runs off screen - Visual story + headless inspector',
  actors: [
    {
      type: 'egg',
      machineVersion: 'hatched-stand-exit',
      componentVersion: 'hatched-stand-exit',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y:
          getGroundY(canvasDimensions.canvasHeight) - ACTOR_SIZE.egg.height / 2,
      },
      id: 'egg-visual',
      machine: hatchedStandExitMachine,
      Component: HatchedStandExit,
    },
    {
      type: 'egg',
      machineVersion: 'hatched-stand-exit-headless',
      componentVersion: 'hatched-stand-exit-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.egg.width, true),
        y:
          getGroundY(canvasDimensions.canvasHeight) - ACTOR_SIZE.egg.height / 2,
      },
      id: 'egg-headless',
      machine: hatchedStandExitHeadlessMachine,
      Component: HatchedStandExitHeadless,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  statelyEmbedUrl: [],
  ...canvasDimensions,
};
