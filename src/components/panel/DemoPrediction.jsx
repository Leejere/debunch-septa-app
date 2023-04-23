import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";

const PredictionList = React.memo(function ({ prediction }) {
  console.log("hello");
  console.log("prediction", prediction);

  const startFrom = 11;
  const predictionListEl = prediction.map((stop, index) => {
    const isBunched = stop.prediction;
    let statusText;
    let buttonVariant;
    if (isBunched === null) {
      statusText = "Unavailable";
      buttonVariant = "light";
    } else if (isBunched === true) {
      statusText = "Bunch";
      buttonVariant = "danger";
    } else {
      statusText = "Fine";
      buttonVariant = "success";
    }
    return (
      <ListGroup.Item key={index} className={panelStyles.tripListItem}>
        <Button
          variant="secondary"
          className={`p-0 ${panelStyles.tripButton} ${panelStyles.nextButton}`}
        >{`Next ${index + startFrom}`}</Button>
        {stop.stop_name}
        <Button
          variant={buttonVariant}
          className={`p-0 ${panelStyles.tripButton} ${panelStyles.resultButton}`}
        >
          {statusText}
        </Button>
      </ListGroup.Item>
    );
  });
  return (
    <ListGroup variant="flush" className={panelStyles.tripList}>
      {predictionListEl}
    </ListGroup>
  );
});

export default React.memo(function ({ prediction, showResults }) {
  const modalContent =
    "Predict whether a trip is going to bunch in the near future";

  const predictionList = prediction[0] ? (
    <PredictionList prediction={prediction} />
  ) : (
    <></>
  );
  return (
    <div
      className={`${panelStyles.module} ${panelStyles.resultModule}`}
      style={{ display: showResults ? "flex" : "none" }}
    >
      <ModuleTitle
        title={"Prediction Results"}
        modalHeading={"Prediction Results"}
        modalContent={modalContent}
      />
      {predictionList}
    </div>
  );
});
