import "./styles/styles.scss";
import { createRoot } from "react-dom/client";
import Nav from "./components/other-components/Nav";
import Map from "./components/map/Map";
import Panel from "./components/panel/Panel";
import React, { useState } from "react";

// Navigation bar
const navEl = document.getElementById("nav");
createRoot(navEl).render(<Nav />);

const appEl = document.getElementById("app");

function App() {
  // Route and direction of current interest
  const initRequestParams = {
    route: "21",
    direction: "1",
  };
  const predictionTemplate = { prediction: null };
  const [requestParams, setRequestParams] = useState(initRequestParams);
  const [prediction, setPrediction] = useState(predictionTemplate);

  return (
    <>
      <Map
        prediction={prediction}
        requestParams={requestParams}
        setRequestParams={setRequestParams}
      />
      <Panel
        requestParams={requestParams}
        setRequestParams={setRequestParams}
      />
    </>
  );
}

createRoot(appEl).render(<App />);
