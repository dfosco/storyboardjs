export const CANVAS_CHILD = Symbol('tiny-canvas-child');

export function authorizeCanvasChild(Component) {
  Component[CANVAS_CHILD] = true;
  return Component;
}

export function isAuthorizedCanvasChild(child) {
  return child?.type?.[CANVAS_CHILD] === true;
}
