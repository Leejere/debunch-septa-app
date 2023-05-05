import React from "react";
import Button from "react-bootstrap/Button";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";

export const ButtonGroup = React.memo(function ({
  valueOptions,
  displayOptions,
  selected,
  handleClick,
}) {
  const buttons = valueOptions.map((value, index) => {
    const variant = value === selected ? "primary" : "light";
    return (
      <Button variant={variant} key={value} onClick={() => handleClick(value)}>
        {displayOptions[index]}
      </Button>
    );
  });
  return <div className={panelStyles.buttonGroup}>{buttons}</div>;
});

export default React.memo(function ({ requestParams, setRequestParams }) {
  const routeOptions = ["21", "47", "33"];
  return (
    <div className={panelStyles.module}>
      <ModuleTitle
        title={"Predicting for:"}
        titleHeavyPart={`${requestParams.route} Bus`}
        modalHeading={"Select a Route"}
        modalContent={
          "As a proof-of-concept, this app only supports a few routes that are mostly linked to Center City and University City."
        }
      />
      {/* Route selector buttons */}
      <ButtonGroup
        valueOptions={routeOptions}
        displayOptions={routeOptions}
        selected={requestParams.route}
        handleClick={(value) => {
          setRequestParams({ ...requestParams, route: value });
        }}
      ></ButtonGroup>
    </div>
  );
});
