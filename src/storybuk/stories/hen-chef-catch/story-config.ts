import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  getCenterX,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { HenChefCatch } from './hen-chef-catch';
import { storyMachine } from './story.machine';

/**
 * Hen-Chef-Catch Story Configuration
 *
 * A coordinated multi-actor story demonstrating:
 * - Stationary hen laying eggs (alternating white/gold)
 * - Eggs falling with rotation
 * - Chef catching eggs with collision detection
 * - Full actor orchestration pattern
 */

// Use narrow horizontal split for side-stage layout
// Wider than egg stories (15%) to accommodate chef (344px) + eggs + margin
const canvasDimensions = calculateStoryCanvasDimensions('horizontal', 30);

// Hen position (top center)
const henX = getCenterX(canvasDimensions.canvasWidth, 120);
const henY = 100;

export const storyConfig: StoryConfig = {
  id: '23',
  type: 'animated',
  title: 'Chef - Catch Egg',
  description:
    'Visual hit testing: Red ellipse shows pot rim collision area, turns yellow when egg hits. No steam animation or points.',
  actors: [
    {
      type: 'hen', // ActorFactory uses type for dynamic imports
      machineVersion: 'chef-catch',
      componentVersion: 'chef-catch',
      startPosition: { x: henX, y: henY },
      id: 'hen-chef-catch-orchestrator',
      machine: storyMachine,
      Component: HenChefCatch,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  ...canvasDimensions,
  statelyEmbedUrl: [
    'https://stately.ai/registry/editor/embed/3a22c0b6-a102-448a-b09b-2f118d881d53?mode=design&colorMode=light&colorMode=light&colorMode=light&machineId=268b27c3-aaea-42d6-b363-7ac795c51978',
  ], // TODO: Add after publishing to Stately
};
