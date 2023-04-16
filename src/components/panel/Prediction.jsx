import React from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";

export default function Prediction({ stopsArray, prediction, showResults }) {
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
}
