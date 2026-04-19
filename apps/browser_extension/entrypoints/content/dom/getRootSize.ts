export const getRootSize = (
  root: Element | null,
): { width: number; height: number } => {
  if (!root) {
    return { width: 0, height: 0 };
  }
  const d = root.ownerDocument;
  if (!d) return { width: 0, height: 0 };
  const rootTagName = root.tagName.toLowerCase();
  const width =
    rootTagName === "body"
      ? Math.max(
          d.documentElement.offsetWidth,
          d.documentElement.scrollWidth,
          root.scrollWidth,
        )
      : root.scrollWidth;
  const height =
    rootTagName === "body"
      ? Math.max(
          d.documentElement.offsetHeight,
          d.documentElement.scrollHeight,
          root.scrollHeight,
        )
      : root.scrollHeight;
  return { width, height };
};
