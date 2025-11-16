import { createBrowserInspector } from '@statelyai/inspect';

/**
 * Custom serializer to handle non-serializable objects like React refs and Konva nodes.
 * This prevents errors when the inspector tries to serialize the machine context.
 */
function serializeForInspector(inspEvent: any) {
  // Deep sanitize the entire event to catch all non-serializable values
  return sanitizeContext(inspEvent);
}

/**
 * Sanitize context by replacing non-serializable values with placeholders
 */
function sanitizeContext(context: any): any {
  // Handle primitives and null/undefined
  if (context === null || context === undefined) {
    return context;
  }

  if (typeof context !== 'object' && typeof context !== 'function') {
    return context;
  }

  // Replace functions with placeholder
  if (typeof context === 'function') {
    return '[Function]';
  }

  // Handle arrays
  if (Array.isArray(context)) {
    return context.map(sanitizeContext);
  }

  // Handle DOM nodes
  if (context instanceof Node || context instanceof Element) {
    return '[DOM Node]';
  }

  // Check if this is a Konva object BEFORE trying to iterate it
  if (context.constructor?.name?.startsWith('Konva')) {
    return { _type: 'Konva.Node', className: context.constructor.name };
  }

  // Check if this is a React ref BEFORE trying to iterate it
  if ('current' in context) {
    return { _type: 'React.Ref' };
  }

  // Handle objects
  const sanitized: any = {};

  try {
    for (const key in context) {
      if (!Object.prototype.hasOwnProperty.call(context, key)) {
        continue;
      }

      const value = context[key];

      // Replace functions
      if (typeof value === 'function') {
        sanitized[key] = '[Function]';
        continue;
      }

      // Replace React refs
      if (value && typeof value === 'object' && 'current' in value) {
        sanitized[key] = { _type: 'React.Ref' };
        continue;
      }

      // Replace Konva objects (check BEFORE recursing)
      if (value && value.constructor?.name?.startsWith('Konva')) {
        sanitized[key] = {
          _type: 'Konva.Node',
          className: value.constructor.name,
        };
        continue;
      }

      // Replace DOM nodes
      if (value instanceof Node || value instanceof Element) {
        sanitized[key] = '[DOM Node]';
        continue;
      }

      // Recursively sanitize nested objects/arrays
      if (value && typeof value === 'object') {
        sanitized[key] = sanitizeContext(value);
        continue;
      }

      // Keep primitive values
      sanitized[key] = value;
    }
  } catch {
    // If we can't iterate the object, return a placeholder
    return '[Non-serializable Object]';
  }

  return sanitized;
}

/**
 * Creates and configures the Stately Inspector for XState machine visualization.
 * The inspector uses a custom serializer to handle non-serializable objects like
 * React refs and Konva nodes.
 */
const { inspect } = createBrowserInspector({
  serialize: serializeForInspector,
});

export { inspect };
