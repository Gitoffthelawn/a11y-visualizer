import React from "react";
import root from "react-shadow";
import type { KeystrokeItem } from "../hooks/useKeystrokes";
import Styles from "./Keystrokes.css?raw";

export const Keystrokes = React.memo(
  ({ keystrokes }: { keystrokes: KeystrokeItem[] }) => {
    return (
      <root.div mode="closed">
        <style>{Styles}</style>
        <ul className="KeystrokesList">
          {keystrokes.map((item) => (
            <li className="Keystroke" key={item.id}>
              <kbd>{item.keys}</kbd>
            </li>
          ))}
        </ul>
      </root.div>
    );
  },
);
