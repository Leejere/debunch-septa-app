import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import Button from "react-bootstrap/Button";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import { directionDictReversed } from "../..";

const TripList = React.memo(function ({
  activeTrips,
  requestParams,
  setRequestParams,
}) {
  const tripsEl = activeTrips.map((trip) => {
    const variant = trip.trip === requestParams.trip ? "danger" : "secondary";
    return (
      <li key={trip.trip} className={panelStyles.tripListItem}>
        <Button
          variant={variant}
          className={`py-0 ${panelStyles.tripButton}`}
          onClick={() => {
            setRequestParams({ ...requestParams, trip: trip.trip });
          }}
        >
          {trip.trip}
        </Button>
        <span>{trip.next_stop_name}</span>
      </li>
    );
  });
  return <ul className={panelStyles.tripList}>{tripsEl}</ul>;
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
      <TripList
        activeTrips={activeTrips}
        requestParams={requestParams}
        setRequestParams={setRequestParams}
      />
    </div>
  );
});
