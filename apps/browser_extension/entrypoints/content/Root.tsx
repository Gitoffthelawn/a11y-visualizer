import React, { useState } from "react";
import { createPortal } from "react-dom";
import { Announcements } from "./components/Announcements";
import { ElementList } from "./components/ElementList";
import { Keystrokes } from "./components/Keystrokes";
import { SettingsContext } from "./contexts/SettingsContext";
import { getRootSize } from "./dom/getRootSize";
import { useDebouncedCallback } from "./hooks/useDebouncedCallback";
import { useElementMeta } from "./hooks/useElementMeta";
import { useKeystrokes } from "./hooks/useKeystrokes";
import { useLiveRegion } from "./hooks/useLiveRegion";
import { injectRoot } from "./injectRoot";

export type RootOptions = {
  srcdoc?: boolean;
  announceMode?: "self" | "parent";
  renderType?: "initial" | "enabled" | "visibilitychange";
};

const getIframeElements = (el: Element): HTMLIFrameElement[] =>
  [...el.querySelectorAll<HTMLIFrameElement>("iframe")].flatMap((iframe) => {
    const iframeWindow = iframe.contentWindow;
    if (!iframeWindow) return iframe;
    try {
      const d = iframeWindow.document;
      const { readyState } = d;
      if (readyState === "complete") {
        return [iframe, ...getIframeElements(d.body)];
      }
    } catch {
      /* noop */
    }
    return iframe;
  });

const injectToFrames = (
  el: Element,
  prevFrames: Element[],
  onUnload: (element: Element, ev: Event) => void,
): Element[] => {
  const frames = [...el.querySelectorAll<Element>("frame")];
  frames.forEach((frameEl) => {
    const frameWindow = (frameEl as HTMLFrameElement).contentWindow;
    if (!frameWindow || prevFrames.includes(frameEl)) return;
    try {
      const d = frameWindow.document;
      const { readyState } = d;
      if (readyState === "complete") {
        injectRoot(frameWindow, d.body, {
          mountOnce: false,
          srcdoc: frameEl.hasAttribute("srcdoc"),
        });
      } else {
        frameWindow.addEventListener("load", () => {
          injectRoot(frameWindow, d.body, {
            srcdoc: frameEl.hasAttribute("srcdoc"),
            mountOnce: false,
          });
        });
      }
      frameWindow.addEventListener("unload", (ev) => {
        onUnload(frameEl, ev);
      });
    } catch {
      /* noop */
    }
  });
  return frames;
};

export const Root = ({
  parentRef,
  options,
}: {
  parentRef: React.RefObject<Element>;
  options?: RootOptions;
}) => {
  const { srcdoc, announceMode = "self" } = options || {};
  const settings = React.useContext(SettingsContext);
  const containerRef = React.useRef<HTMLDivElement>(null);
  const framesRef = React.useRef<Element[]>([]);
  const iframeElementsRef = React.useRef<HTMLIFrameElement[]>([]);

  const [width, setWidth] = useState(0);
  const [height, setHeight] = useState(0);
  const viewportWidthRef = React.useRef(0);
  const viewportHeightRef = React.useRef(0);
  const viewportScrollXRef = React.useRef(0);
  const viewportScrollYRef = React.useRef(0);

  const { announcements, observeLiveRegion } = useLiveRegion({
    parentRef,
    iframeElementsRef,
    renderType: options?.renderType,
  });
  const { keystrokes, listenForKeyStrokes } = useKeystrokes({ parentRef });
  const { metaList, topLayers, iframeLayers, updateMetaList } = useElementMeta({
    parentRef,
    containerRef,
    srcdoc,
    viewportScrollXRef,
    viewportScrollYRef,
    viewportWidthRef,
    viewportHeightRef,
  });

  const [outdated, setOutDated] = React.useState(false);

  const firstTimeUpdateRef = React.useRef(true);
  const updateInfo = useDebouncedCallback(
    () => {
      setOutDated(false);
      if (!containerRef.current) return;
      if (!parentRef.current) return;
      const iframeElements = getIframeElements(parentRef.current);
      iframeElementsRef.current = iframeElements;

      framesRef.current = injectToFrames(
        parentRef.current,
        framesRef.current,
        (el) => {
          framesRef.current = framesRef.current.filter((e) => e !== el);
          setOutDated(true);
        },
      );
      observeLiveRegion(parentRef.current, {
        firstTime: firstTimeUpdateRef.current,
      });
      listenForKeyStrokes({ iframeElements });
      updateMetaList(iframeElements);
      firstTimeUpdateRef.current = false;
    },
    200,
    [injectToFrames, settings, observeLiveRegion],
  );

  const updateSize = useDebouncedCallback(
    () => {
      const { width, height } = getRootSize(parentRef.current);
      setWidth(width);
      setHeight(height);
      const w = parentRef.current?.ownerDocument.defaultView;
      viewportWidthRef.current = w?.innerWidth ?? viewportWidthRef.current;
      viewportHeightRef.current = w?.innerHeight ?? viewportHeightRef.current;
    },
    200,
    [parentRef, updateInfo],
  );

  const updateScroll = useDebouncedCallback(
    () => {
      const w = parentRef.current?.ownerDocument.defaultView;
      viewportScrollXRef.current = w?.scrollX ?? viewportScrollXRef.current;
      viewportScrollYRef.current = w?.scrollY ?? viewportScrollYRef.current;
    },
    200,
    [parentRef, updateInfo],
  );

  const updateAll = useDebouncedCallback(
    () => {
      updateSize();
      updateScroll();
      updateInfo();
    },
    200,
    [parentRef, updateInfo, updateSize, updateScroll],
  );

  React.useEffect(() => {
    if (outdated) updateInfo();
  }, [updateInfo, outdated]);

  React.useEffect(() => {
    updateAll();
    const observer = new MutationObserver(updateAll);
    const childrenObserver = new MutationObserver((records) => {
      records.forEach((record) => {
        record.addedNodes.forEach((node) => {
          observer.observe(node, {
            childList: true,
            subtree: true,
            attributes: true,
          });
        });
      });
    });

    if (parentRef.current) {
      childrenObserver.observe(parentRef.current, {
        childList: true,
        subtree: false,
        attributes: false,
        characterData: false,
      });
      [...parentRef.current.children].forEach((el) => {
        if (el.contains(containerRef.current)) return;
        observer.observe(el, {
          childList: true,
          subtree: true,
          attributes: true,
        });
      });
    }
    return () => {
      childrenObserver.disconnect();
      observer.disconnect();
    };
  }, [parentRef, updateAll]);

  React.useEffect(() => {
    const resizeEvents = ["resize"];
    const scrollEvents = ["scroll"];
    const events = [
      "scroll",
      "keydown",
      "mousedown",
      "mousemove",
      "mousewheel",
      "change",
    ];

    const onScroll = () => {
      updateScroll();
      updateInfo();
    };
    const onResize = () => {
      updateSize();
      updateInfo();
    };

    const w = parentRef.current?.ownerDocument?.defaultView;
    const windows = [
      w,
      ...iframeElementsRef.current.map(
        (iframe) => iframe.ownerDocument?.defaultView,
      ),
    ];
    windows.forEach((w) => {
      if (!w) return;
      resizeEvents.forEach((event) => {
        try {
          w.addEventListener(event, onResize);
        } catch {
          /* noop */
        }
      });
      scrollEvents.forEach((event) => {
        try {
          w.addEventListener(event, onScroll);
        } catch {
          /* noop */
        }
      });
      events.forEach((event) => {
        try {
          w.addEventListener(event, updateInfo);
        } catch {
          /* noop */
        }
      });
    });

    return () => {
      windows.forEach((w) => {
        if (!w) return;
        resizeEvents.forEach((event) => {
          try {
            w.removeEventListener(event, onResize);
          } catch {
            /* noop */
          }
        });
        scrollEvents.forEach((event) => {
          try {
            w.removeEventListener(event, onScroll);
          } catch {
            /* noop */
          }
        });
        events.forEach((event) => {
          try {
            w.removeEventListener(event, updateInfo);
          } catch {
            /* noop */
          }
        });
      });
    };
  }, [parentRef, updateInfo, updateSize, updateScroll]);

  return (
    <section
      aria-label={`Accessibility Visualizer <${parentRef.current?.tagName?.toLowerCase()}>`}
      aria-hidden="true"
      style={{
        position: "static",
        margin: 0,
        padding: 0,
      }}
      ref={containerRef}
    >
      <ElementList list={metaList} width={width} height={height} />
      {topLayers.map(({ element, metaList, width, height }, i) =>
        createPortal(
          <ElementList list={metaList} width={width} height={height} />,
          element,
          `layer-${i}-${element.tagName.toLowerCase()}`,
        ),
      )}
      {iframeLayers.map(({ element, metaList, width, height }, i) =>
        createPortal(
          <ElementList list={metaList} width={width} height={height} />,
          element,
          `iframe-${i}`,
        ),
      )}
      {settings.showLiveRegions && announceMode === "self" && (
        <Announcements announcements={announcements} />
      )}
      {settings.showKeystrokes && (
        <Keystrokes
          keystrokes={keystrokes}
          opacityPercent={settings.keystrokeOpacityPercent}
          fontSize={settings.keystrokeFontSize}
        />
      )}
    </section>
  );
};
