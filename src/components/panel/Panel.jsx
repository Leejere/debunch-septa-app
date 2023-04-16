import React from "react";
import panelStyles from "./Panel.module.scss";

import TimeDisplayer from "./TimeDisplayer";
import RouteSelector from "./RouteSelector";
import DirectionSelector from "./DirectionSelector";
import BusTripSelector from "./BusTripSelector";
import GetPredictionButton from "./GetPredictionButton";

export default function Panel({
  prediction,
  requestParams,
  setRequestParams,
  realtimeData,
  stopsArray,
}) {
  const fetchPrediction = () => {
    console.log(requestParams);
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
      <GetPredictionButton onClick={fetchPrediction} />
    </section>
  );
}
