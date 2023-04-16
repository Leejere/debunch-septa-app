import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import { directionDictReversed } from "../..";

const TripList = React.memo(function ({ activeTrips }) {
  const tripsEl = activeTrips.map((trip) => {
    return (
      <li key={trip.trip}>
        <span>{trip.trip}</span>
        <span>{trip.next_stop_name}</span>
      </li>
    );
  });
  return <ul>{tripsEl}</ul>;
});

export default React.memo(function ({
  requestParams,
  setRequestParams,
  realtimeData,
}) {
  const [activeTrips, setActiveTrips] = useState([]);
  useEffect(() => {
    if (!realtimeData) return;
    const trips = realtimeData.bus.filter((bus) => {
      return (
        directionDictReversed[requestParams.route][
          capitalizeFirstLetter(bus.Direction)
        ] === requestParams.direction
      );
    });
    setActiveTrips(trips);
  }, [realtimeData]);

  useEffect(() => {
    console.log(activeTrips);
  }, [activeTrips]);

  const modalContent =
    "Select a trip to predict. You can do so by clicking on this panel or on the map";
  return (
    <div className={panelStyles.module}>
      <ModuleTitle
        title={"Predicting for:"}
        modalHeading={"Trip Selection"}
        modalContent={modalContent}
      />
      <TripList activeTrips={activeTrips} />
    </div>
  );
});
