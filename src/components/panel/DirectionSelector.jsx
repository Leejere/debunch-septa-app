import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import { directionDict } from "../../index.js";
import { ButtonGroup } from "./RouteSelector";
import Button from "react-bootstrap/Button";
import { FontAwesomeIcon } from "@fortawesome/react-fontawesome";
import { faRepeat } from "@fortawesome/free-solid-svg-icons";

const ArrowWithSwitch = ({ setRequestParams }) => {
  const handleClick = () => {
    setRequestParams((prev) => {
      const newDirection = prev.direction === "0" ? "1" : "0";
      return { ...prev, direction: newDirection };
    });
  };
  return (
    <div className={panelStyles.arrowContainer}>
      <Button
        variant="danger"
        className={panelStyles.switchIconContainer}
        onClick={handleClick}
      >
        <FontAwesomeIcon icon={faRepeat} style={{ color: "#ffffff" }} />
      </Button>
      <div className={panelStyles.arrowBody} />
      <div className={panelStyles.arrowHead} />
    </div>
  );
};

const EndStopDisplayer = React.memo(function ({ abbr, name }) {
  return (
    <div className={panelStyles.directionDisplayerStop}>
      <div className={panelStyles.directionDisplayerStopAbbr}>{abbr}</div>
      <div className={panelStyles.directionDisplayerStopName}>{name}</div>
    </div>
  );
});

const DirectionDisplayer = React.memo(function ({
  setRequestParams,
  startStop,
  endStop,
}) {
  return (
    <div className={panelStyles.directionDisplayer}>
      <EndStopDisplayer abbr={startStop.abbr} name={startStop.name} />
      <ArrowWithSwitch setRequestParams={setRequestParams} />
      <EndStopDisplayer abbr={endStop.abbr} name={endStop.name} />
    </div>
  );
});

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
  const [startStop, setStartStop] = useState({ name: null, abbr: null });
  const [endStop, setEndStop] = useState({ name: null, abbr: null });
  useEffect(() => {
    if (!stopsArray[0]) return;
    setStartStop({ name: stopsArray[0].name, abbr: stopsArray[0].abbr });
    setEndStop({
      name: stopsArray[stopsArray.length - 1].name,
      abbr: stopsArray[stopsArray.length - 1].abbr,
    });
  }, [stopsArray]);

  const currentDirection = requestParams.direction;
  const currentDirectionName =
    directionDict[requestParams.route][currentDirection];

  return (
    <div className={panelStyles.module}>
      <ModuleTitle
        title={`Predicting for:`}
        titleHeavyPart={currentDirectionName}
        modalHeading={"Select a Direction"}
        modalContent={
          "Select a direction based on the termini and arrows shown in the panel."
        }
      />
      <DirectionDisplayer
        setRequestParams={setRequestParams}
        startStop={startStop}
        endStop={endStop}
      />
    </div>
  );
});
