import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
} from '../../story-config-constants';

export const storyConfig: StoryConfig = {
  id: 'Chef Idle',
  type: 'static',
  title: 'Chef - Idle',
  description:
    'Stationary chef in idle state (simplest possible demo) - Visual story + headless inspector',
  actors: [
    {
      type: 'chef',
      machineVersion: 'idle',
      componentVersion: 'idle',
      startPosition: { x: 960, y: 36 }, // Center X, positioned near bottom
      id: 'chef-visual',
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'vertical-split-bottom',
  statelyEmbedUrl: '',
  ...calculateStoryCanvasDimensions(
    'vertical',
    CHEF_STORY_CANVAS_HEIGHT_PERCENT
  ),
};
