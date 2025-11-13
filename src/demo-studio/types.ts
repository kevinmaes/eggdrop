import type { LayoutMode } from './demo-constants';
import type { ActorRefFrom } from 'xstate';

/**
 * Position on the canvas
 */
export interface Position {
  x: number;
  y: number;
}

/**
 * Configuration for a demo background
 */
export interface BackgroundConfig {
  type: 'none' | 'solid' | 'image' | 'game';
  color?: string;
  image?: string;
}

/**
 * Configuration for a single actor in a demo
 */
export interface ActorConfig {
  type: 'hen' | 'chef' | 'egg';
  machineVersion: string;
  componentVersion: string;
  startPosition: Position;
  id?: string;
  canvasWidth?: number;
  canvasHeight?: number;
}

/**
 * Configuration for a complete demo
 */
export interface DemoConfig {
  id: string;
  actors: ActorConfig[];
  background: BackgroundConfig;
  title: string;
  description?: string;
  layoutMode?: LayoutMode;
  inspector?: {
    visible: boolean;
    position?: 'left' | 'right' | 'bottom';
    statelyEmbedUrl?: string;
  };
}

/**
 * Runtime instance of a demo actor
 */
export interface DemoActorInstance {
  actor: ActorRefFrom<any>;
  Component: React.ComponentType<any>;
  config: ActorConfig;
}

/**
 * Collection of all demo configurations
 */
export type DemoConfigs = Record<string, DemoConfig>;
