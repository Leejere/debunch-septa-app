import React from "react";
import Button from "react-bootstrap/Button";
import panelStyles from "./Panel.module.scss";

export default function GetPredictionButton() {
  return (
    <Button className={panelStyles.getPredictionButton}>Get Prediction</Button>
  );
}
