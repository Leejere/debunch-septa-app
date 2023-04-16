import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";

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
        setStopsSequence(stopsArray.slice(index, index + 20));
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
    </div>
  );
});
