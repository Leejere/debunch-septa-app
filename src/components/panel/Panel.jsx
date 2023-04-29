import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";

import DemoModeSetter from "./DemoModeSetter";
import TimeDisplayer from "./TimeDisplayer";
import RouteSelector from "./RouteSelector";
import DirectionSelector from "./DirectionSelector";
import BusTripSelector from "./BusTripSelector";
import Prediction from "./Prediction";
import PredictionFallback from "./PredictionFallback";

export default function Panel({
  isTriggeringCache,
  setIsTriggeringCache,
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
  // Whether to show prediction results or resort to fallback
  const [showResults, setShowResults] = useState(false);

  // Fallback message
  const [fallbackMessage, setFallbackMessage] = useState(
    "Fetching prediction..."
  );

  const fetchDemoPrediction = async () => {
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

  const fetchRealtimePrediction = async () => {
    console.log(requestParams);
    setShowResults(false);
    setFallbackMessage("Fetching prediction...");
    const urlRoot =
      "https://us-east1-septa-bunching-prediction.cloudfunctions.net/make-predictions?";
    setShowResults(false);
    const url = `${urlRoot}route=${requestParams.route}&direction=${requestParams.direction}&trip=${requestParams.trip}`;

    try {
      const response = await fetch(url);
      if (response.status === 500) {
        const message = await response.text();
        setFallbackMessage(message);
      } else if (response.status === 206) {
        const message = await response.text();
        setFallbackMessage(message);
      } else {
        const result = await response.json();
        setPrediction(result);
        setShowResults(true);
      }
    } catch (error) {
      console.log(error);
    }
  };

  const predictionPanel = showResults ? (
    <Prediction
      stopsArray={stopsArray}
      currentStop={currentStop}
      prediction={prediction}
      isDemo={isDemo}
    />
  ) : (
    <PredictionFallback fallbackMessage={fallbackMessage} />
  );
  useEffect(() => {
    if (isDemo) {
      fetchDemoPrediction();
    } else {
      fetchRealtimePrediction();
    }
  }, [
    requestParams.route,
    requestParams.direction,
    requestParams.trip,
    isDemo,
  ]);

  return (
    <section className={panelStyles.container}>
      <DemoModeSetter
        isDemo={isDemo}
        setIsDemo={setIsDemo}
        isTriggeringCache={isTriggeringCache}
        setIsTriggeringCache={setIsTriggeringCache}
      />
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
        isDemo={isDemo}
      />
      {/* <GetPredictionButton
        fetchPrediction={fetchPrediction}
        requestParams={requestParams}
      /> */}
      {predictionPanel}
    </section>
  );
}
