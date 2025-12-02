/**
 * Storybuk Theme - Colors and styling based on Storybook design system
 *
 * Color palette extracted from Storybook UI to match the look and feel
 */

export const STORYBUK_FONTS = {
  base: '"Nunito Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
  mono: '"Courier New", Courier, monospace',
} as const;

export const STORYBUK_COLORS = {
  // Header
  header: {
    background: '#ffffff',
    border: '#e8e8e8',
    text: '#333333',
  },

  // Sidebar navigation
  sidebar: {
    background: '#F6F9FC',
    folderBackground: '#E3E8ED',
    border: '#e8e8e8',
    text: '#37352f',
    textHover: '#1a1918',
    folderIcon: '#73737d',
  },

  // Navigation items
  navigation: {
    itemBackground: 'transparent',
    itemBackgroundHover: '#e6f7ff',
    itemBackgroundActive: '#e6f7ff',
    itemText: '#37352f',
    itemTextHover: '#1a1918',
    itemTextActive: '#1565C0',
    itemBorder: 'transparent',
    itemBorderActive: '#2196F3',
  },

  // Buttons
  button: {
    primary: {
      background: '#2196F3',
      backgroundHover: '#1976D2',
      text: '#ffffff',
      border: '#2196F3',
    },
    secondary: {
      background: '#ffffff',
      backgroundHover: '#f5f5f5',
      text: '#333333',
      border: '#e8e8e8',
    },
  },

  // Content areas
  content: {
    background: '#ffffff',
    canvasBackground: '#ffffff',
    statelyBackground: '#1a1a1a',
    border: '#e8e8e8',
  },

  // Text
  text: {
    primary: '#333333',
    secondary: '#666666',
    tertiary: '#999999',
    disabled: '#cccccc',
    inverse: '#ffffff',
  },

  // Status colors
  status: {
    success: '#4CAF50',
    warning: '#FF9800',
    error: '#F44336',
    info: '#2196F3',
  },

  // Story demo background color (lighter blue-gray for better UI integration while maintaining contrast for white sprites)
  storyDemoBackground: '#5a8aa8',
} as const;

export const STORYBUK_LAYOUT = {
  total: { width: 1920, height: 1080 },
  sidebar: {
    width: 300,
    height: 1080, // Full height
    header: { height: 80 }, // Logo area at top of sidebar
  },
  header: { height: 60 }, // Main header (right side only)
  contentArea: { width: 1620, height: 1020 }, // 1920 - 300 sidebar, 1080 - 60 header

  // Orientation-specific layouts
  horizontal: {
    storyCanvas: { width: 810, height: 1020 }, // Left half
    statelyCanvas: { width: 810, height: 1020 }, // Right half
  },
  vertical: {
    storyCanvas: { width: 1620, height: 510 }, // Top half
    statelyCanvas: { width: 1620, height: 510 }, // Bottom half
  },
} as const;

export const KEYBOARD_INDICATOR = {
  width: 140,
  height: 50,
  padding: 16,
  cornerRadius: 8,
  backgroundColor: 'rgba(255, 255, 255, 0.9)',
  textSize: 18,
  activeOpacity: 1.0,
  inactiveOpacity: 0.6,
} as const;

export type SplitOrientation = 'horizontal' | 'vertical';
