import React, { useState } from "react";
import Button from "react-bootstrap/Button";
import panelStyles from "./Panel.module.scss";

export default function GetPredictionButton({
  fetchPrediction,
  requestParams,
}) {
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
      onClick={fetchPrediction}
      className={panelStyles.getPredictionButton}
    >
      Get Prediction
    </Button>
  );
}
