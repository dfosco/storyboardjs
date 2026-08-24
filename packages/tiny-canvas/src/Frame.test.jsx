/**
 * @vitest-environment jsdom
 */
import React from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import {
  cleanup,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import Canvas from "./Canvas.jsx";
import Frame from "./Frame.jsx";

function setPageManifest(widgets = {}) {
  const script = document.createElement("script");
  script.id = "tiny-canvas-pages";
  script.type = "application/json";
  script.textContent = JSON.stringify({
    pages: [],
    widgets,
    environment: "prod",
  });
  document.head.append(script);
}

describe("Frame load strategies", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.restoreAllMocks();
  });

  afterEach(() => {
    cleanup();
    document.getElementById("tiny-canvas-pages")?.remove();
    window.history.replaceState({}, "", "/");
  });

  it("keeps existing Frames eager by default", () => {
    const { container } = render(
      <Canvas>
        <Frame route="/settings" title="Settings" />
      </Canvas>
    );

    expect(container.querySelector("iframe")?.getAttribute("src")).toBe(
      "/settings?embedView=1"
    );
    expect(
      screen.queryByRole("button", { name: /Click to interact with/ })
    ).toBeNull();
  });

  it("requires a snapshot for explicit interaction loading", () => {
    vi.spyOn(console, "error").mockImplementation(() => {});

    expect(() =>
      render(
        <Canvas>
          <Frame
            route="/settings"
            title="Settings"
            loadStrategy="interaction"
          />
        </Canvas>
      )
    ).toThrow(
      'Frame loadStrategy="interaction" requires a non-empty snapshot.'
    );
  });

  it("does not create an iframe until a snapshot gate is activated", async () => {
    const { container } = render(
      <Canvas>
        <Frame
          id="settings"
          route="/settings"
          title="Settings"
          snapshot="/settings.png"
        />
      </Canvas>
    );
    const button = screen.getByRole("button", {
      name: "Click to interact with Settings",
    });
    const guard = container.querySelector(".tc-frame-interaction-guard");

    expect(container.querySelector("iframe")).toBeNull();
    expect(
      container.querySelector(".tc-frame-snapshot").getAttribute("src")
    ).toBe("/settings.png");

    fireEvent.pointerDown(button);
    fireEvent.click(guard);

    const iframe = container.querySelector("iframe");
    expect(iframe?.getAttribute("src")).toBe("/settings?embedView=1");
    expect(
      screen
        .getByRole("button", { name: "Loading Settings" })
        .hasAttribute("disabled")
    ).toBe(true);

    fireEvent.load(iframe);
    expect(container.querySelector(".tc-frame-poster")).toBeNull();
    expect(
      screen.queryByRole("button", { name: "Click to interact with Settings" })
    ).toBeNull();

    iframe.contentDocument.dispatchEvent(
      new KeyboardEvent("keydown", { key: "Escape" })
    );
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "Click to interact with Settings",
        })
      ).toBe(document.activeElement)
    );
    expect(container.querySelector("iframe")).toBe(iframe);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Click to interact with Settings",
      })
    );
    fireEvent.pointerDown(container.querySelector(".tc-canvas"));
    await waitFor(() =>
      expect(
        screen.getByRole("button", {
          name: "Click to interact with Settings",
        })
      ).toBeTruthy()
    );
    expect(container.querySelector("iframe")).toBe(iframe);

    fireEvent.click(
      screen.getByRole("button", {
        name: "Click to interact with Settings",
      })
    );
    expect(container.querySelector("iframe")).toBe(iframe);
  });

  it("uses a native dark picture source when provided", () => {
    const { container } = render(
      <Canvas>
        <Frame
          route="/settings"
          title="Settings"
          snapshot="/settings.png"
          snapshotDark="/settings-dark.png"
        />
      </Canvas>
    );

    expect(
      container
        .querySelector('source[media="(prefers-color-scheme: dark)"]')
        ?.getAttribute("srcset")
    ).toBe("/settings-dark.png");
    expect(container.querySelector("picture img")?.getAttribute("src")).toBe(
      "/settings.png"
    );
  });

  it("keeps all snapshot-gated Frames dormant during startup", () => {
    const { container } = render(
      <Canvas>
        {Array.from({ length: 12 }, (_, index) => (
          <Frame
            key={index}
            route={`/screen-${index}`}
            title={`Screen ${index}`}
            snapshot={`/screen-${index}.png`}
          />
        ))}
      </Canvas>
    );

    expect(container.querySelectorAll("iframe")).toHaveLength(0);
    expect(container.querySelectorAll(".tc-frame-snapshot")).toHaveLength(12);
  });

  it("supports eager widget defaults, instance overrides, and snapshot fallback", () => {
    setPageManifest({
      Frame: {
        loadStrategy: "eager",
      },
    });
    const { container } = render(
      <Canvas>
        <Frame route="/eager" title="Eager" snapshot="/eager.png" />
        <Frame
          route="/gated"
          title="Gated"
          snapshot="/gated.png"
          loadStrategy="interaction"
        />
      </Canvas>
    );

    expect(container.querySelector('iframe[title="Eager"]')).toBeTruthy();
    expect(container.querySelector('iframe[title="Gated"]')).toBeNull();

    fireEvent.error(container.querySelector('img[src="/gated.png"]'));
    expect(screen.getByText("Preview unavailable")).toBeTruthy();
    expect(container.querySelector('iframe[title="Gated"]')).toBeNull();
  });
});
