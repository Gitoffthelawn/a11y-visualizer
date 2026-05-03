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
}: {
  parentRef: React.RefObject<Element>;
}) => {
  const { showKeystrokes, keystrokeDisplaySeconds } =
    React.useContext(SettingsContext);
  const [keystrokes, setKeystrokes] = React.useState<KeystrokeItem[]>([]);
  const keystrokeDisplaySecondsRef = React.useRef(keystrokeDisplaySeconds);

  React.useEffect(() => {
    keystrokeDisplaySecondsRef.current = keystrokeDisplaySeconds;
  }, [keystrokeDisplaySeconds]);

  const handleKeydown = React.useCallback((e: KeyboardEvent) => {
    const keys = formatKeyEvent(e);
    const id = nextId++;
    const timestamp = Date.now();
    setKeystrokes((prev) =>
      [{ id, keys, timestamp }, ...prev].slice(0, MAX_ITEMS),
    );

    setTimeout(() => {
      setKeystrokes((prev) => prev.filter((item) => item.id !== id));
    }, keystrokeDisplaySecondsRef.current * 1000);
  }, []);

  const listeningWindowsRef = React.useRef<Window[]>([]);

  const listenWindows = React.useCallback(
    (windows: Window[]) => {
      const removedWindows = listeningWindowsRef.current.filter(
        (w) => !windows.includes(w),
      );
      const addedWindows = windows.filter(
        (w) => !listeningWindowsRef.current.includes(w),
      );
      removedWindows.forEach((w) => {
        try {
          w.removeEventListener("keydown", handleKeydown, true);
        } catch {
          /* noop */
        }
      });
      addedWindows.forEach((w) => {
        try {
          w.addEventListener("keydown", handleKeydown, true);
          listeningWindowsRef.current.push(w);
        } catch {
          /* noop */
        }
      });
    },
    [handleKeydown],
  );

  const listenForKeyStrokes = React.useCallback(
    ({ iframeElements }: { iframeElements: HTMLIFrameElement[] }) => {
      const windows = [
        parentRef.current?.ownerDocument?.defaultView,
        ...iframeElements.map((iframe) => {
          try {
            return iframe.contentWindow;
          } catch {
            return null;
          }
        }),
      ].filter((v): v is Window => !!v);
      listenWindows(windows);
    },
    [listenWindows, parentRef],
  );

  React.useEffect(() => {
    if (!showKeystrokes) {
      setKeystrokes([]);
      return;
    }
  }, [showKeystrokes]);

  return {
    keystrokes,
    listenForKeyStrokes,
  };
};
