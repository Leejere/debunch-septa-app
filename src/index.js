import "./styles/styles.scss";
import { createRoot } from "react-dom/client";
import Nav from "./components/other-components/Nav";
import Map from "./components/map/Map";
import Panel from "./components/panel/Panel";
import React, { useState, useEffect } from "react";
import { reverseSubDicts } from "./utils/reverseDict";

// Navigation bar
const navEl = document.getElementById("nav");
createRoot(navEl).render(<Nav />);

const appEl = document.getElementById("app");

function App() {
  // Route and direction of current interest
  const initRequestParams = {
    route: "33",
    direction: "0",
    trip: 64838,
  };
  const predictionTemplate = { prediction: null };
  const [requestParams, setRequestParams] = useState(initRequestParams);
  const [realtimeData, setRealtimeData] = useState(null);

  const [isDemo, setIsDemo] = useState(true);
  const [isTriggeringCache, setIsTriggeringCache] = useState(false);

  // Stops array for current route and direction
  const [currentStop, setCurrentStop] = useState(null);
  const [stopsArray, setStopsArray] = useState([]);

  // Prediction data required from cloud after sending request params
  const [prediction, setPrediction] = useState(predictionTemplate);

  // Trigger cache function
  useEffect(() => {
    const triggerCacheFunction = async () => {
      const cacheTransitViewFunctionUrl =
        "https://us-east1-septa-bunching-prediction.cloudfunctions.net/cache-transit-view";

      await fetch(cacheTransitViewFunctionUrl);
      console.log("Cached some TransitView data");
    };
    const clearCache = async () => {
      const clearCacheFunctionUrl =
        "https://us-east1-septa-bunching-prediction.cloudfunctions.net/delete-cache";
      await fetch(clearCacheFunctionUrl);
      console.log("Cleared cache");
    };

    const firstTriggerCacheFunction = async () => {
      // await clearCache();
      await triggerCacheFunction();
    };

    if (isTriggeringCache) {
      setInterval(triggerCacheFunction, 10000);
      firstTriggerCacheFunction();
    }

    return () => {
      clearInterval(triggerCacheFunction);
    };
  }, [isTriggeringCache]);

  // Fetch data from transit view
  useEffect(() => {
    const fetchRealtime = async (route) => {
      const demoUrlRoot =
        "https://raw.githubusercontent.com/Leejere/debunch-septa-app/main/db/demo-transit-view/";
      const urlRoot =
        "https://us-east1-septa-transitview-proxy.cloudfunctions.net/septaProxy?route=";
      const url = isDemo ? `${demoUrlRoot}${route}.json` : `${urlRoot}${route}`;
      const response = await fetch(url);
      const data = await response.json();
      setRealtimeData(data);
    };

    if (isDemo) {
      fetchRealtime(requestParams.route);
      return;
    } else {
      const fetchRealtimeInterval = setInterval(async () => {
        // Fetch realtime data every 10 seconds
        fetchRealtime(requestParams.route);
      }, 10000);
      fetchRealtime(requestParams.route);
      return () => clearInterval(fetchRealtimeInterval);
    }
  }, [requestParams.route, isDemo]);

  return (
    <>
      <Map
        prediction={prediction} // Pass down prediction gotten from cloud
        requestParams={requestParams} // Pass down request params
        setCurrentStop={setCurrentStop}
        setRequestParams={setRequestParams} // Pass down method to set request params
        realtimeData={realtimeData} // Pass down realtime location data from transit view
        setStopsArray={setStopsArray} // Pass down method to set current stops array
        isDemo={isDemo}
      />
      <Panel
        isTriggeringCache={isTriggeringCache}
        setIsTriggeringCache={setIsTriggeringCache}
        prediction={prediction}
        setPrediction={setPrediction}
        requestParams={requestParams}
        currentStop={currentStop}
        setCurrentStop={setCurrentStop}
        setRequestParams={setRequestParams}
        realtimeData={realtimeData}
        stopsArray={stopsArray}
        isDemo={isDemo}
        setIsDemo={setIsDemo}
      />
    </>
  );
}

export const directionDict = {
  21: { 0: "Eastbound", 1: "Westbound" },
  33: { 0: "Southbound", 1: "Northbound" },
  47: { 0: "Southbound", 1: "Northbound" },
};

export const directionDictReversed = reverseSubDicts(directionDict);

createRoot(appEl).render(<App />);
