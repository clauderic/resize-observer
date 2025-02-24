// Tests if target is an SVGGraphicsElement
const isSVG = (target: Element): boolean => target instanceof SVGElement && 'getBBox' in target;

// Checks to see if element is hidden (has no display)
const isHidden = (target: Element): boolean => {
  if (isSVG(target)) {
    const { width, height } = (target as SVGGraphicsElement).getBBox();
    return !width && !height;
  }
  const { offsetWidth, offsetHeight } = target as HTMLElement;
  return !(offsetWidth || offsetHeight || target.getClientRects().length);
}

export {
  isSVG,
  isHidden
};
