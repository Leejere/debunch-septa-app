import React from "react";
import panelStyles from "./Panel.module.scss";

import TimeDisplayer from "./TimeDisplayer";
import RouteSelector from "./RouteSelector";
import DirectionSelector from "./DirectionSelector";
import GetPredictionButton from "./GetPredictionButton";

export default function Panel({ requestParams, setRequestParams, stopsArray }) {
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
      <GetPredictionButton onClick={fetchPrediction} />
    </section>
  );
}
