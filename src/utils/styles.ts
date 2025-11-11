/**
 * Utility functions for accessing CSS custom properties from JavaScript
 */

/**
 * Generic helper to read CSS custom properties from the document root
 * @param propertyName - The CSS custom property name (e.g., '--border-radius-base')
 * @returns The property value as a string, or empty string if unavailable
 */
function getCSSCustomProperty(propertyName: string): string {
  if (typeof window === 'undefined') return '';
  const styles = window.getComputedStyle(document.documentElement);
  return styles.getPropertyValue(propertyName).trim();
}

/**
 * Get the border radius value from CSS custom property --border-radius-base
 * @returns The border radius as a number in pixels, or 0 if unavailable
 */
export function getBorderRadius(): number {
  const radius = getCSSCustomProperty('--border-radius-base');
  return parseInt(radius) || 0;
}
