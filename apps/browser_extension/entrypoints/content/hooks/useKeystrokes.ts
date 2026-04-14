import React from "react";
import { SettingsContext } from "../contexts/SettingsContext";
import { formatKeyEvent } from "../utils/formatKeyEvent";

export type KeystrokeItem = {
  id: number;
  keys: string;
  timestamp: number;
};

const MAX_ITEMS = 20;
let nextId = 0;

export const useKeystrokes = ({
  parentRef,
  iframeElements,
}: {
  parentRef: React.RefObject<Element>;
  iframeElements: HTMLIFrameElement[];
}) => {
  const { showKeystrokes, keystrokeDisplaySeconds } =
    React.useContext(SettingsContext);
  const [keystrokes, setKeystrokes] = React.useState<KeystrokeItem[]>([]);
  const iframeElementsRef = React.useRef(iframeElements);
  const keystrokeDisplaySecondsRef = React.useRef(keystrokeDisplaySeconds);

  React.useEffect(() => {
    iframeElementsRef.current = iframeElements;
  }, [iframeElements]);

  React.useEffect(() => {
    keystrokeDisplaySecondsRef.current = keystrokeDisplaySeconds;
  }, [keystrokeDisplaySeconds]);

  React.useEffect(() => {
    if (!showKeystrokes) {
      setKeystrokes([]);
      return;
    }

    const handleKeydown = (e: KeyboardEvent) => {
      const keys = formatKeyEvent(e);
      const id = nextId++;
      const timestamp = Date.now();
      setKeystrokes((prev) =>
        [{ id, keys, timestamp }, ...prev].slice(0, MAX_ITEMS),
      );

      setTimeout(() => {
        setKeystrokes((prev) => prev.filter((item) => item.id !== id));
      }, keystrokeDisplaySecondsRef.current * 1000);
    };

    const addListeners = (windows: Window[]) => {
      windows.forEach((w) => {
        try {
          w.addEventListener("keydown", handleKeydown, true);
        } catch {
          /* noop */
        }
      });
    };

    const removeListeners = (windows: Window[]) => {
      windows.forEach((w) => {
        try {
          w.removeEventListener("keydown", handleKeydown, true);
        } catch {
          /* noop */
        }
      });
    };

    const getWindows = (): Window[] => {
      const parentWindow = parentRef.current?.ownerDocument?.defaultView;
      return [
        parentWindow,
        ...iframeElementsRef.current.map((iframe) => {
          try {
            return iframe.contentWindow;
          } catch {
            return null;
          }
        }),
      ].filter((w): w is Window => w != null);
    };

    const windows = getWindows();
    addListeners(windows);

    return () => {
      removeListeners(windows);
    };
  }, [showKeystrokes, parentRef]);

  return keystrokes;
};
