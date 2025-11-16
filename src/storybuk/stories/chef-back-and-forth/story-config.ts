import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
} from '../../story-config-constants';

export const storyConfig: StoryConfig = {
  id: 'Chef Back And Forth',
  type: 'animated',
  title: 'Chef - Moving',
  description:
    'Chef moves back and forth left to right - Visual story + headless inspector',
  actors: [
    {
      type: 'chef',
      machineVersion: 'back-and-forth',
      componentVersion: 'back-and-forth',
      startPosition: { x: 960, y: 36 },
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
