import React from "react";
import panelStyles from "./Panel.module.scss";

import TimeDisplayer from "./TimeDisplayer";
import RouteSelector from "./RouteSelector";
import DirectionSelector from "./DirectionSelector";
import BusTripSelector from "./BusTripSelector";
import GetPredictionButton from "./GetPredictionButton";
import Prediction from "./Prediction";

export default function Panel({
  prediction,
  requestParams,
  setRequestParams,
  realtimeData,
  stopsArray,
}) {
  const [showResults, setShowResults] = React.useState(false);
  const fetchPrediction = () => {
    console.log(requestParams);
    setShowResults(true);
  };

  return (
    <section className={panelStyles.container}>
      <TimeDisplayer />
      <RouteSelector
        requestParams={requestParams}
        setRequestParams={setRequestParams}
      />
      <DirectionSelector
        requestParams={requestParams}
        setRequestParams={setRequestParams}
        stopsArray={stopsArray}
      />
      <BusTripSelector
        requestParams={requestParams}
        setRequestParams={setRequestParams}
        realtimeData={realtimeData}
      />
      <GetPredictionButton
        fetchPrediction={fetchPrediction}
        requestParams={requestParams}
      />
      <Prediction
        stopsArray={stopsArray}
        prediction={prediction}
        showResults={showResults}
      />
    </section>
  );
}
