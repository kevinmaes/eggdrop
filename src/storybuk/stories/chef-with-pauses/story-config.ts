import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  CHEF_STORY_CANVAS_HEIGHT_PERCENT,
} from '../../story-config-constants';

export const storyConfig: StoryConfig = {
  id: 'Chef With Pauses',
  type: 'animated',
  title: 'Chef - Move + Stop',
  description:
    'Chef moves with random pauses and faces direction of movement - Visual demo',
  actors: [
    {
      type: 'chef',
      machineVersion: 'with-pauses',
      componentVersion: 'with-pauses',
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
