import React from "react";
import Button from "react-bootstrap/Button";
import panelStyles from "./Panel.module.scss";

function ButtonGroup({ valueOptions, displayOptions, selected, handleClick }) {
  const buttons = valueOptions.map((value, index) => {
    const variant = value === selected ? "primary" : "light";
    return (
      <Button
        className="mx-2"
        variant={variant}
        key={value}
        onClick={() => handleClick(value)}
      >
        {displayOptions[index]}
      </Button>
    );
  });
  return <div className="mb-3">{buttons}</div>;
}

export default function Panel({ requestParams, setRequestParams }) {
  const routeOptions = ["21", "47", "33", "7"];

  const directionOptions = {
    21: ["Westbound", "Eastbound"], // In the sequence of 0 and 1.
    33: ["Southbound", "Northbound"],
    47: ["Southbound", "Northbound"],
    7: ["Northbound", "Southbound"],
  };
  const routeSelectButtonGroup = (
    <ButtonGroup
      valueOptions={routeOptions}
      displayOptions={routeOptions}
      selected={requestParams.route}
      handleClick={(value) => {
        setRequestParams({ ...requestParams, route: value });
      }}
    ></ButtonGroup>
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
