import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import Button from "react-bootstrap/Button";
import ListGroup from "react-bootstrap/ListGroup";
import capitalizeFirstLetter from "../../utils/capitalizeFirstLetter";
import { directionDictReversed } from "../..";

const TripList = React.memo(function ({
  activeTrips,
  requestParams,
  setRequestParams,
  setCurrentStop,
}) {
  const tripsEl = activeTrips.map((trip) => {
    const isSelectedTrip = trip.trip === requestParams.trip;

    const isInService = !!trip.next_stop_name; // Turn into boolean
    const middleWord = isInService ? "near" : "Not in Service";
    const onTripClick = isInService
      ? (trip) => {
          setRequestParams({ ...requestParams, trip: trip.trip });
          setCurrentStop(trip.next_stop_id);
        }
      : () => {};
    const buttonVariant = isSelectedTrip
      ? "primary"
      : isInService
      ? "secondary"
      : "light";
    const buttonTextColor = isInService ? "white" : "#bbb";
    const listGroupVariant = isSelectedTrip ? "secondary" : "light";

    return (
      <ListGroup.Item
        variant={listGroupVariant}
        key={trip.trip}
        className={panelStyles.tripListItem}
        onClick={() => {
          onTripClick(trip);
        }}
      >
        <Button
          variant={buttonVariant}
          className={`py-0 ${panelStyles.tripButton}`}
          style={{ color: buttonTextColor }}
        >
          {trip.trip}
        </Button>
        <span className={panelStyles.tripListNear}>{middleWord}</span>
        <span className={panelStyles.tripListStopName}>
          {trip.next_stop_name}
        </span>
      </ListGroup.Item>
    );
  });
  return (
    <ListGroup variant="flush" className={panelStyles.tripList}>
      {tripsEl}
    </ListGroup>
  );
});

export default React.memo(function ({
  requestParams,
  setRequestParams,
  setCurrentStop,
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
    trips.forEach((trip) => {
      if (trip.next_stop_name) {
        setRequestParams({ ...requestParams, trip: trip.trip });
        setCurrentStop(trip.next_stop_id);
        return;
      }
    });
  }, [realtimeData]);

  const modalContent =
    "Select a trip to predict. You can do so by clicking on this panel or on the map";
  return (
    <div className={panelStyles.module}>
      <ModuleTitle
        title={"Predicting for:"}
        titleHeavyPart={`Trip ${requestParams.trip}`}
        modalHeading={"Trip Selection"}
        modalContent={modalContent}
      />
      <TripList
        activeTrips={activeTrips}
        requestParams={requestParams}
        setRequestParams={setRequestParams}
        setCurrentStop={setCurrentStop}
      />
    </div>
  );
});
