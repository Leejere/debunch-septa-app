import React from "react";
import Button from "react-bootstrap/Button";
import panelStyles from "./Panel.module.scss";

import { directionDict } from "../../index.js";

import { ButtonGroup, RouteSelector } from "./RouteSelector";
export default function Panel({ requestParams, setRequestParams }) {
  const directionOptions = {};
  for (const key in directionDict) {
    if (directionDict.hasOwnProperty(key)) {
      const directions = directionDict[key];
      directionOptions[key] = [directions[0], directions[1]];
    }
  }

  const routeSelectButtonGroup = (
    <RouteSelector
      requestParams={requestParams}
      setRequestParams={setRequestParams}
    />
  );
  const directionSelectButtonGroup = (
    <ButtonGroup
      valueOptions={["0", "1"]}
      displayOptions={directionOptions[requestParams.route]}
      selected={requestParams.direction}
      handleClick={(value) => {
        setRequestParams({ ...requestParams, direction: value });
      }}
    ></ButtonGroup>
  );
  return (
    <section className={panelStyles.container}>
      {routeSelectButtonGroup}
      {directionSelectButtonGroup}
    </section>
  );
}
