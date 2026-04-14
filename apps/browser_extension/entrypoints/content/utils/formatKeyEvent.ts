const SPECIAL_KEY_MAP: Record<string, string> = {
  ArrowUp: "↑",
  ArrowDown: "↓",
  ArrowLeft: "←",
  ArrowRight: "→",
  " ": "Space",
  Escape: "Esc",
  Enter: "Enter",
  Backspace: "Backspace",
  Delete: "Delete",
  Tab: "Tab",
  Home: "Home",
  End: "End",
  PageUp: "PageUp",
  PageDown: "PageDown",
  Insert: "Insert",
};

const MODIFIER_KEYS = new Set(["Control", "Alt", "Shift", "Meta"]);

export const formatKeyEvent = (event: {
  ctrlKey: boolean;
  altKey: boolean;
  shiftKey: boolean;
  metaKey: boolean;
  key: string;
}): string => {
  const parts: string[] = [];

  if (event.ctrlKey && event.key !== "Control") parts.push("Ctrl");
  if (event.altKey && event.key !== "Alt") parts.push("Alt");
  if (event.shiftKey && event.key !== "Shift") parts.push("Shift");
  if (event.metaKey && event.key !== "Meta") parts.push("Cmd");

  if (MODIFIER_KEYS.has(event.key)) {
    if (parts.length === 0) {
      switch (event.key) {
        case "Control":
          return "Ctrl";
        case "Meta":
          return "Cmd";
        default:
          return event.key;
      }
    }
    return parts.join(" + ");
  }

  const keyDisplay =
    SPECIAL_KEY_MAP[event.key] ??
    (event.key.length === 1 ? event.key.toUpperCase() : event.key);

  parts.push(keyDisplay);
  return parts.join(" + ");
};
