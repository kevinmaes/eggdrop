import { createBrowserInspector } from '@statelyai/inspect';

/**
 * Shared Inspector Instance
 *
 * Creates a single inspector instance that can be reused across all demos.
 * When switching demos, we close and reopen the inspector window to ensure
 * it shows the new actor instead of the old one.
 */

let sharedInspectorInstance: ReturnType<typeof createBrowserInspector> | null =
  null;

export function getSharedInspector() {
  if (!sharedInspectorInstance) {
    sharedInspectorInstance = createBrowserInspector();
  }
  return sharedInspectorInstance;
}

/**
 * Closes the current inspector window and creates a new inspector instance.
 * This ensures the inspector shows only the new actor when switching demos.
 *
 * Call this BEFORE creating new actors so they connect to the fresh inspector.
 */
export function closeAndReopenInspector() {
  // Close the current inspector window if it exists
  if (sharedInspectorInstance?.adapter?.targetWindow) {
    try {
      sharedInspectorInstance.adapter.targetWindow.close();
    } catch (error) {
      console.warn('Failed to close inspector window:', error);
    }
  }

  // Nullify the instance so next getSharedInspector() creates a new one
  sharedInspectorInstance = null;

  // Return the new inspector instance
  return getSharedInspector();
}

/**
 * Closes the inspector window without reopening it.
 * Used when inspector is toggled off.
 */
export function closeInspectorIfOpen() {
  if (sharedInspectorInstance?.adapter?.targetWindow) {
    try {
      sharedInspectorInstance.adapter.targetWindow.close();
    } catch (error) {
      console.warn('Failed to close inspector window:', error);
    }
  }
  sharedInspectorInstance = null;
}
