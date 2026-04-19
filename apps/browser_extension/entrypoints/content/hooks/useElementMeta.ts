import React from "react";
import {
  type CategorySettings,
  defaultCustomCategorySettings,
  getCategorySettingsFromMode,
} from "../../../src/settings";
import { SettingsContext } from "../contexts/SettingsContext";
import { collectElements } from "../dom";
import { getRootSize } from "../dom/getRootSize";
import type { ElementMeta } from "../types";

type Layer = {
  element: Element;
  metaList: ElementMeta[];
  width: number;
  height: number;
};

const collectTopLayers = (
  el: Element,
  container: Element | null,
  categorySettings: CategorySettings,
  srcdoc: boolean | undefined,
  hideOutOfSightElementTips: boolean | undefined,
) => {
  const elements = [...el.querySelectorAll("dialog, [popover]")];
  const layers: Layer[] = elements
    .map((element: Element): Layer | null => {
      if (container?.contains(element)) return null;
      const metaList = collectElements(element, [], categorySettings, {
        srcdoc,
        hideOutOfSightElementTips,
      });
      const { width, height } = getRootSize(element);
      return {
        element,
        metaList,
        width,
        height,
      };
    })
    .filter((el): el is Layer => !!el);
  return layers;
};

const collectIFrames = (
  iframeElements: HTMLIFrameElement[],
  categorySettings: CategorySettings,
  hideOutOfSightElementTips: boolean | undefined,
): Layer[] =>
  iframeElements
    .map((iframe): Layer | null => {
      const iframeWindow = iframe.contentWindow;
      if (!iframeWindow) return null;
      try {
        const d = iframeWindow.document;
        const { readyState } = d;
        if (readyState === "complete") {
          const metaList = collectElements(d.body, [], categorySettings, {
            srcdoc: iframe.hasAttribute("srcdoc"),
            hideOutOfSightElementTips,
          });
          const { width, height } = getRootSize(d.body);
          return {
            element: d.body,
            metaList,
            width,
            height,
          };
        }
      } catch {
        /* noop */
      }
      return null;
    })
    .filter((el): el is Layer => !!el);

export const useElementMeta = ({
  parentRef,
  containerRef,
  srcdoc,
}: {
  parentRef: React.RefObject<Element>;
  containerRef: React.RefObject<HTMLElement>;
  srcdoc?: boolean;
}) => {
  const [metaList, setMetaList] = React.useState<ElementMeta[]>([]);
  const [topLayers, setTopLayers] = React.useState<Layer[]>([]);
  const [iframeLayers, setIframeLayers] = React.useState<Layer[]>([]);
  const settings = React.useContext(SettingsContext);

  const updateMetaList = React.useCallback(
    (iframeElements: HTMLIFrameElement[]) => {
      if (!containerRef.current) return;
      if (!parentRef.current) return;
      if (!settings.accessibilityInfo) {
        setMetaList([]);
        setIframeLayers([]);
        setTopLayers([]);
        return;
      }

      const categorySettings = getCategorySettingsFromMode(
        settings.elementTypeMode,
        defaultCustomCategorySettings,
      );

      const display = containerRef.current.style.display;
      containerRef.current.style.display = "none";

      const topLayers = collectTopLayers(
        parentRef.current,
        containerRef.current,
        categorySettings,
        srcdoc,
        settings.hideOutOfSightElementTips,
      );
      setTopLayers(topLayers);
      setIframeLayers(
        collectIFrames(
          iframeElements,
          categorySettings,
          settings.hideOutOfSightElementTips,
        ),
      );

      const elements = collectElements(
        parentRef.current,
        [containerRef.current, ...topLayers.map((e) => e.element)].filter(
          (el): el is Element => !!el,
        ),
        categorySettings,
        {
          srcdoc,
          hideOutOfSightElementTips: settings.hideOutOfSightElementTips,
        },
      );
      setMetaList(elements);

      containerRef.current.style.display = display;
    },
    [containerRef, parentRef, settings, srcdoc],
  );

  return {
    metaList,
    topLayers,
    iframeLayers,
    updateMetaList,
  };
};
