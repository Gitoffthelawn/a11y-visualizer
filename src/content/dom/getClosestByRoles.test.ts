import { describe, test, expect, afterEach } from "vitest";
import { getClosestByRoles } from "./getClosestByRoles";

describe("getClosestRoles", () => {
  afterEach(() => {
    document.body.innerHTML = "";
  });

  test("single role attribute", () => {
    const parent = document.createElement("div");
    parent.setAttribute("role", "button");
    const element = document.createElement("div");
    parent.appendChild(element);
    document.body.appendChild(parent);
    const result = getClosestByRoles(element, ["button", "link"]);
    expect(result).toBe(parent);
  });

  test("multiple role attributes", () => {
    const parent = document.createElement("div");
    parent.setAttribute("role", "unknownbutton button");
    const element = document.createElement("div");
    parent.appendChild(element);
    document.body.appendChild(parent);
    const result = getClosestByRoles(element, ["button", "link"]);
    expect(result).toBe(parent);
  });

  test("implicit role", () => {
    const parent = document.createElement("button");
    const element = document.createElement("div");
    parent.appendChild(element);
    document.body.appendChild(parent);
    const result = getClosestByRoles(element, ["button", "link"]);
    expect(result).toBe(parent);
  });

  test("grandparent", () => {
    const grandparent = document.createElement("div");
    grandparent.setAttribute("role", "button");
    const parent = document.createElement("div");
    grandparent.appendChild(parent);
    const element = document.createElement("div");
    parent.appendChild(element);
    document.body.appendChild(grandparent);
    const result = getClosestByRoles(element, ["button", "link"]);
    expect(result).toBe(grandparent);
  });

  test("no role", () => {
    const parent = document.createElement("div");
    const element = document.createElement("div");
    parent.appendChild(element);
    document.body.appendChild(parent);
    const result = getClosestByRoles(element, ["button", "link"]);
    expect(result).toBe(null);
  });
});
