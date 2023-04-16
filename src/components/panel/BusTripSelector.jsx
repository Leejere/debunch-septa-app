import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";

export default React.memo(function ({ requestParams, setRequestParams }) {
  return (
    <div className={panelStyles.module}>
      <ModuleTitle
        title={"Predicting for:"}
        modalHeading={"Trip Selection"}
        modalContent={
          "Select a trip to predict. You can do so by clicking on this panel or on the map"
        }
      />
    </div>
  );
});
