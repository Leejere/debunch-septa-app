import React from "react";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";

export default function DemoModeSetter({ isDemo, setIsDemo }) {
  return (
    <ToggleButtonGroup name="demoModeSetter">
      <ToggleButton>Demo</ToggleButton>
      <ToggleButton>Real-time</ToggleButton>
    </ToggleButtonGroup>
  );
}
