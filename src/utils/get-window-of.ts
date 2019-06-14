
declare global {
  interface Window {
    Element: typeof Element;
  }
}

export default function getWindowOf(target: Element): Window {
  const targetWindow = target && target.ownerDocument && target.ownerDocument.defaultView;

  // Return the local window object if it's not possible extract one from
  // provided element.
  return targetWindow || window;
}
