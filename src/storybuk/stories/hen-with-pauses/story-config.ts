import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  HEN_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  getCenterY,
  ACTOR_SIZE,
} from '../../story-config-constants';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  HEN_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: 'Hen With Pauses',
  type: 'animated',
  title: 'Hen - With Pauses',
  description:
    'Back and forth movement with 1-2 second pauses - Visual story + headless inspector',
  actors: [
    {
      type: 'hen',
      machineVersion: 'with-pauses',
      componentVersion: 'with-pauses',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-visual',
    },
    {
      type: 'hen',
      machineVersion: 'with-pauses-headless',
      componentVersion: 'with-pauses-headless',
      startPosition: {
        x: getCenterX(canvasDimensions.canvasWidth, ACTOR_SIZE.hen.width),
        y: getCenterY(canvasDimensions.canvasHeight, ACTOR_SIZE.hen.height),
      },
      id: 'hen-headless',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-top',
  statelyEmbedUrl: '',
  ...canvasDimensions,
};
