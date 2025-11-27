import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  EGG_STORY_CANVAS_WIDTH_PERCENT,
  getCenterX,
  getGroundY,
  ACTOR_SIZE,
} from '../../story-config-constants';

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
