import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";

import DemoModeSetter from "./DemoModeSetter";
import TimeDisplayer from "./TimeDisplayer";
import RouteSelector from "./RouteSelector";
import DirectionSelector from "./DirectionSelector";
import BusTripSelector from "./BusTripSelector";
import GetPredictionButton from "./GetPredictionButton";
import Prediction from "./Prediction";

export default function Panel({
  prediction,
  setPrediction,
  requestParams,
  currentStop,
  setCurrentStop,
  setRequestParams,
  realtimeData,
  stopsArray,
  isDemo,
  setIsDemo,
}) {
  // Whether to show prediction results
  const [showResults, setShowResults] = useState(false);

  const fetchPrediction = async () => {
    console.log(requestParams);
    const demoUrlRoot =
      "https://raw.githubusercontent.com/Leejere/debunch-septa-app/main/db/demo-prediction-forward/";
    const urlRoot =
      "https://raw.githubusercontent.com/Leejere/debunch-septa-app/main/db/mock_prediction.json";
    setShowResults(false);
    const url = isDemo
      ? `${demoUrlRoot}${requestParams.route}-${requestParams.direction}-${requestParams.trip}.json`
      : `${urlRoot}`;

    try {
      const response = await fetch(url);
      const result = await response.json();
      setPrediction(result.prediction);
      setShowResults(true);
    } catch (error) {
      console.log(error);
    }
  };

  const predictionPanel = (
    <Prediction
      stopsArray={stopsArray}
      currentStop={currentStop}
      prediction={prediction}
      showResults={showResults}
      isDemo={isDemo}
    />
  );
  useEffect(() => {
    fetchPrediction();
  }, [requestParams.route, requestParams.direction, requestParams.trip]);

  return (
    <section className={panelStyles.container}>
      <DemoModeSetter isDemo={isDemo} setIsDemo={setIsDemo} />
      <TimeDisplayer isDemo={isDemo} />
      <RouteSelector
        requestParams={requestParams}
        setRequestParams={setRequestParams}
        isDemo={isDemo}
        setIsDemo={setIsDemo}
      />
      <DirectionSelector
        requestParams={requestParams}
        setRequestParams={setRequestParams}
        stopsArray={stopsArray}
      />
      <BusTripSelector
        requestParams={requestParams}
        setRequestParams={setRequestParams}
        setCurrentStop={setCurrentStop}
        realtimeData={realtimeData}
      />
      {/* <GetPredictionButton
        fetchPrediction={fetchPrediction}
        requestParams={requestParams}
      /> */}
      {predictionPanel}
    </section>
  );
}
