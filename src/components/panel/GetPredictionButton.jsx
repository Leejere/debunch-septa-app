import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import panelStyles from "./Panel.module.scss";

export default function GetPredictionButton({ onClick, requestParams }) {
  const [abled, setAbled] = useState(false);

  // Check if all request params are set
  if (requestParams.route && requestParams.direction && requestParams.trip) {
    if (!abled) setAbled(true);
  } else {
    if (abled) setAbled(false);
  }

  return (
    <Button
      disabled={!abled}
      onClick={onClick}
      className={panelStyles.getPredictionButton}
    >
      Get Prediction
    </Button>
  );
}
