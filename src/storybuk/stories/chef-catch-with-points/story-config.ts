import {
  calculateStoryCanvasDimensions,
  STORYBUK_COLORS,
  type StoryConfig,
  getCenterX,
} from '../../story-config-constants';

// Explicit imports - no pattern matching!
import { ChefCatchWithPoints } from './chef-catch-with-points';
import { storyMachine } from './story.machine';

/**
 * Chef-Catch-With-Points Story Configuration
 *
 * A coordinated multi-actor story demonstrating:
 * - Stationary hen laying eggs (alternating white/gold)
 * - Eggs falling with rotation
 * - Chef catching eggs with collision detection
 * - Steam animation when catching
 * - Points spawning (+1 for white, +10 for gold)
 * - Full actor orchestration with visual feedback
 */

// Use narrow horizontal split for side-stage layout
// Wider than egg stories (15%) to accommodate chef (344px) + eggs + margin
const canvasDimensions = calculateStoryCanvasDimensions('horizontal', 30);

// Hen position (top center)
const henX = getCenterX(canvasDimensions.canvasWidth, 120);
const henY = 100;

export const storyConfig: StoryConfig = {
  id: '24',
  type: 'animated',
  title: 'Chef - Catch with Points',
  description:
    'Full catch experience: Chef catches eggs with steam animation and points spawning (+1 for white, +10 for gold). Demonstrates complete collision detection with visual feedback.',
  actors: [
    {
      type: 'hen', // ActorFactory uses type for dynamic imports
      machineVersion: 'chef-catch',
      componentVersion: 'chef-catch',
      startPosition: { x: henX, y: henY },
      id: 'chef-catch-with-points-orchestrator',
      machine: storyMachine,
      Component: ChefCatchWithPoints,
    },
  ],
  background: {
    type: 'solid',
    color: STORYBUK_COLORS.storyDemoBackground,
  },
  layoutMode: 'horizontal-split-narrow',
  ...canvasDimensions,
  statelyEmbedUrl: '', // TODO: Add after publishing to Stately
};
