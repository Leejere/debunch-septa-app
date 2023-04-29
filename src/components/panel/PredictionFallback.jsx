import React, { useState, useEffect, useCallback, useRef } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";

const PredictionList = React.memo(function ({ fallbackMessage }) {
  return (
    <ListGroup variant="flush" className={panelStyles.tripList}>
      <ListGroup.Item className={panelStyles.tripListItem}>
        {fallbackMessage}
      </ListGroup.Item>
    </ListGroup>
  );
});

export default React.memo(function ({ fallbackMessage }) {
  const modalContent =
    "Predict whether a trip is going to bunch in the near future";
  return (
    <div className={`${panelStyles.module} ${panelStyles.resultModule}`}>
      <ModuleTitle
        title={"Prediction Results"}
        modalHeading={"Prediction Results"}
        modalContent={modalContent}
      />
      <PredictionList fallbackMessage={fallbackMessage} />
    </div>
  );
});
