import { describe, expect, test } from "vitest";
import { formatKeyEvent } from "./formatKeyEvent";

const makeEvent = (
  key: string,
  {
    ctrlKey = false,
    altKey = false,
    shiftKey = false,
    metaKey = false,
  }: {
    ctrlKey?: boolean;
    altKey?: boolean;
    shiftKey?: boolean;
    metaKey?: boolean;
  } = {},
) => ({ key, ctrlKey, altKey, shiftKey, metaKey });

describe("formatKeyEvent", () => {
  test("normal character key", () => {
    expect(formatKeyEvent(makeEvent("a"))).toBe("A");
  });

  test("number key", () => {
    expect(formatKeyEvent(makeEvent("1"))).toBe("1");
  });

  test("modifier key alone - Shift", () => {
    expect(formatKeyEvent(makeEvent("Shift", { shiftKey: true }))).toBe(
      "Shift",
    );
  });

  test("modifier key alone - Control", () => {
    expect(formatKeyEvent(makeEvent("Control", { ctrlKey: true }))).toBe(
      "Ctrl",
    );
  });

  test("modifier key alone - Meta", () => {
    expect(formatKeyEvent(makeEvent("Meta", { metaKey: true }))).toBe("Cmd");
  });

  test("modifier key alone - Alt", () => {
    expect(formatKeyEvent(makeEvent("Alt", { altKey: true }))).toBe("Alt");
  });

  test("Ctrl + A", () => {
    expect(formatKeyEvent(makeEvent("a", { ctrlKey: true }))).toBe("Ctrl + A");
  });

  test("Ctrl + Shift + A", () => {
    expect(
      formatKeyEvent(makeEvent("a", { ctrlKey: true, shiftKey: true })),
    ).toBe("Ctrl + Shift + A");
  });

  test("modifier key order: Ctrl + Alt + Shift + Cmd", () => {
    expect(
      formatKeyEvent(
        makeEvent("a", {
          ctrlKey: true,
          altKey: true,
          shiftKey: true,
          metaKey: true,
        }),
      ),
    ).toBe("Ctrl + Alt + Shift + Cmd + A");
  });

  test("arrow keys", () => {
    expect(formatKeyEvent(makeEvent("ArrowRight"))).toBe("→");
    expect(formatKeyEvent(makeEvent("ArrowLeft"))).toBe("←");
    expect(formatKeyEvent(makeEvent("ArrowUp"))).toBe("↑");
    expect(formatKeyEvent(makeEvent("ArrowDown"))).toBe("↓");
  });

  test("Space key", () => {
    expect(formatKeyEvent(makeEvent(" "))).toBe("Space");
  });

  test("Escape key", () => {
    expect(formatKeyEvent(makeEvent("Escape"))).toBe("Esc");
  });

  test("Tab key", () => {
    expect(formatKeyEvent(makeEvent("Tab"))).toBe("Tab");
  });

  test("Shift + Tab", () => {
    expect(formatKeyEvent(makeEvent("Tab", { shiftKey: true }))).toBe(
      "Shift + Tab",
    );
  });

  test("combined modifier keys without main key - Ctrl + Shift", () => {
    expect(
      formatKeyEvent(makeEvent("Shift", { ctrlKey: true, shiftKey: true })),
    ).toBe("Ctrl");
  });
});
