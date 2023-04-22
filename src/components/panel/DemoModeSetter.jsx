import React from "react";
import panelStyles from "./Panel.module.scss";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

export default function DemoModeSetter({ isDemo, setIsDemo }) {
  return (
    <ToggleButtonGroup
      name="demoModeSetter"
      value={isDemo ? "demo" : "realtime"}
      className={panelStyles.demoModeSetter}
      onChange={() => {
        setIsDemo((prev) => !prev);
      }}
    >
      <ToggleButton
        id="demo"
        value="demo"
        variant={isDemo ? "primary" : "light"}
      >
        Demo
      </ToggleButton>
      <ToggleButton
        id="realtime"
        value="realtime"
        variant={isDemo ? "light" : "primary"}
      >
        Real-time
      </ToggleButton>
    </ToggleButtonGroup>
  );
}
