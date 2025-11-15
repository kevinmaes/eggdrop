import type { LayoutMode } from './story-constants';
import type { SplitOrientation } from './storybuk-theme';
import type { ActorRefFrom } from 'xstate';

/**
 * Position on the canvas
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Configuration for a story background
 */
export interface BackgroundConfig {
  type: 'none' | 'solid' | 'image' | 'game' | 'stage';
  color?: string;
  image?: string;
  stageColor?: string;
  stageHeightPercent?: number;
  stageWidthPercent?: number;
}

/**
 * Configuration for a single actor in a story
 */
export interface ActorConfig {
  type: 'hen' | 'chef' | 'egg' | 'egg-caught-points';
  machineVersion: string;
  componentVersion: string;
  startPosition: Position;
  id?: string;
  eggColor?: string; // For egg-caught-points
}

/**
 * Configuration for a complete story
 */
export interface StoryConfig {
  id: string;
  actors: ActorConfig[];
  background: BackgroundConfig;
  title: string;
  description?: string;
  layoutMode?: LayoutMode;
  splitOrientation?: SplitOrientation;
  canvasWidth: number;
  canvasHeight: number;
  statelyEmbedUrl?: string;
}

/**
 * Runtime instance of a story actor
 */
export interface StoryActorInstance {
  actor: ActorRefFrom<any>;
  Component: React.ComponentType<any>;
  config: ActorConfig;
}

/**
 * Collection of all story configurations
 */
export type StoryConfigs = Record<string, StoryConfig>;
