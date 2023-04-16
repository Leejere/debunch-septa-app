import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import { directionDict } from "../../index.js";
import { ButtonGroup } from "./RouteSelector";

export default React.memo(function ({
  requestParams,
  setRequestParams,
  stopsArray,
}) {
  // Get display names of two directions (xBound, xBound)
  const directionOptions = {};
  for (const key in directionDict) {
    if (directionDict.hasOwnProperty(key)) {
      const directions = directionDict[key];
      directionOptions[key] = [directions[0], directions[1]];
    }
  }

  // Get starting and ending stops
  const [startStop, setStartStop] = useState({ name: null, id: null });
  const [endStop, setEndStop] = useState({ name: null, id: null });
  useEffect(() => {
    setStartStop({ name: stopsArray[0].name, id: stopsArray[0].id });
    setEndStop({
      name: stopsArray[stopsArray.length - 1].name,
      id: stopsArray[stopsArray.length - 1].id,
    });
  }, [stopsArray]);

  return (
    <div className={panelStyles.module}>
      <ModuleTitle
        title={"Select a Direction"}
        modalHeading={"Select a Direction"}
        modalContent={
          "Select a direction based on the termini and arrows shown in the panel."
        }
      />
      <ButtonGroup
        valueOptions={["0", "1"]}
        displayOptions={directionOptions[requestParams.route]}
        selected={requestParams.direction}
        handleClick={(value) => {
          setRequestParams({ ...requestParams, direction: value });
        }}
      ></ButtonGroup>
    </div>
  );
});
