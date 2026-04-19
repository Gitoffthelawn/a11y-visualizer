export const getViewPort = (element: Element) => {
  const d = element.ownerDocument;
  const w = d.defaultView;
  return {
    scrollX: w?.scrollX ?? 0,
    scrollY: w?.scrollY ?? 0,
    innnerWidth: w?.innerHeight ?? 0,
    innerHeight: w?.innerWidth ?? 0,
  };
};
