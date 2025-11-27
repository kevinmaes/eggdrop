import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
  getCenterX,
  ACTOR_SIZE,
} from '../../story-config-constants';

const canvasDimensions = calculateStoryCanvasDimensions(
  'vertical',
  CHEF_STORY_CANVAS_HEIGHT_PERCENT
);

export const storyConfig: StoryConfig = {
  id: 'Chef Idle',
  storyId: '18',
  type: 'static',
  title: 'Chef - Idle',
  description:
    'Stationary chef in idle state (simplest possible demo) - Visual story + headless inspector',
  actors: [
    {
      type: 'chef',
      machineVersion: 'idle',
      componentVersion: 'idle',
      startPosition: {
        x: getCenterX(
          canvasDimensions.canvasWidth,
          ACTOR_SIZE.chef.width,
          true
        ),
        y: 36,
      },
      id: 'chef-visual',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-bottom',
  statelyEmbedUrl: '',
  ...canvasDimensions,
};
