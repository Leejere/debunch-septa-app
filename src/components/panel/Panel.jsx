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
  setRequestParams,
  realtimeData,
  stopsArray,
  isDemo,
  setIsDemo,
}) {
  // Whether to show prediction results
  const [showResults, setShowResults] = useState(false);
  // The nearest stop of the currently selected trip
  const [currentStop, setCurrentStop] = useState(null);

  const fetchPrediction = async () => {
    console.log(requestParams);
    setShowResults(false);

    const url =
      "https://raw.githubusercontent.com/Leejere/debunch-septa-app/main/db/mock_prediction.json";
    try {
      const response = await fetch(url);
      const result = await response.json();
      setPrediction(result.prediction);
      setShowResults(true);
    } catch (error) {
      console.log(error);
    }
  };

  useEffect(() => {
    console.log(prediction);
  }, [prediction]);

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
      <GetPredictionButton
        fetchPrediction={fetchPrediction}
        requestParams={requestParams}
      />
      <Prediction
        stopsArray={stopsArray}
        currentStop={currentStop}
        prediction={prediction}
        showResults={showResults}
      />
    </section>
  );
}
