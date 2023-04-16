import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";

const PredictionList = React.memo(function ({ stopsSequence, prediction }) {
  const startFrom = 11;
  const predictionListEl = stopsSequence.slice(startFrom).map((stop, index) => {
    console.log(prediction[index + startFrom]);
    return (
      <ListGroup.Item key={index} className={panelStyles.tripListItem}>
        <Button
          variant="secondary"
          className={`p-0 ${panelStyles.tripButton} ${panelStyles.nextButton}`}
        >{`Next ${index + startFrom}`}</Button>
        {stop.name}
        <Button
          variant="secondary"
          className={`p-0 ${panelStyles.tripButton} ${panelStyles.resultButton}`}
        >
          Okay
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

export default React.memo(function ({
  stopsArray,
  currentStop,
  prediction,
  showResults,
}) {
  const [stopsSequence, setStopsSequence] = useState([]);
  useEffect(() => {
    stopsArray.forEach((stop, index) => {
      if (Number(stop.id) === Number(currentStop)) {
        const sliced = stopsArray.slice(index, index + 20);
        setStopsSequence(stopsArray.slice(index, index + 20));
        return;
      }
    });
  }, [currentStop]);
  const modalContent =
    "Predict whether a trip is going to bunch in the near future";
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
      <PredictionList stopsSequence={stopsSequence} prediction={prediction} />
    </div>
  );
});
