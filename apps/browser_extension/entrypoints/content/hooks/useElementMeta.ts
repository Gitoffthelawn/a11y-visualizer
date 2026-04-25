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

type ViewportOptions = {
  viewportScrollX?: number;
  viewportScrollY?: number;
  viewportWidth?: number;
  viewportHeight?: number;
};

const collectTopLayers = (
  el: Element,
  container: Element | null,
  categorySettings: CategorySettings,
  srcdoc: boolean | undefined,
  hideOutOfSightElementTips: boolean | undefined,
  viewportOptions?: ViewportOptions,
) => {
  const elements = [...el.querySelectorAll("dialog, [popover]")];
  const layers: Layer[] = elements
    .map((element: Element): Layer | null => {
      if (container?.contains(element)) return null;
      const metaList = collectElements(element, [], categorySettings, {
        srcdoc,
        hideOutOfSightElementTips,
        ...viewportOptions,
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
  viewportScrollXRef,
  viewportScrollYRef,
  viewportWidthRef,
  viewportHeightRef,
}: {
  parentRef: React.RefObject<Element>;
  containerRef: React.RefObject<HTMLElement>;
  srcdoc?: boolean;
  viewportScrollXRef: React.RefObject<number>;
  viewportScrollYRef: React.RefObject<number>;
  viewportWidthRef: React.RefObject<number>;
  viewportHeightRef: React.RefObject<number>;
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

      const viewportOptions: ViewportOptions = {
        viewportScrollX: viewportScrollXRef?.current ?? undefined,
        viewportScrollY: viewportScrollYRef?.current ?? undefined,
        viewportWidth: viewportWidthRef?.current ?? undefined,
        viewportHeight: viewportHeightRef?.current ?? undefined,
      };

      const display = containerRef.current.style.display;
      containerRef.current.style.display = "none";

      const topLayers = collectTopLayers(
        parentRef.current,
        containerRef.current,
        categorySettings,
        srcdoc,
        settings.hideOutOfSightElementTips,
        viewportOptions,
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
          ...viewportOptions,
        },
      );
      setMetaList(elements);

      containerRef.current.style.display = display;
    },
    [
      containerRef,
      parentRef,
      settings,
      srcdoc,
      viewportScrollXRef,
      viewportScrollYRef,
      viewportWidthRef,
      viewportHeightRef,
    ],
  );

  return {
    metaList,
    topLayers,
    iframeLayers,
    updateMetaList,
  };
};
