import React from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import { directionDict } from "../../index.js";
import { ButtonGroup } from "./RouteSelector";

export default React.memo(function ({ requestParams, setRequestParams }) {
  const directionOptions = {};
  for (const key in directionDict) {
    if (directionDict.hasOwnProperty(key)) {
      const directions = directionDict[key];
      directionOptions[key] = [directions[0], directions[1]];
    }
  }
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
