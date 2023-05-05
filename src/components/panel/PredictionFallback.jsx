import React, { useState, useEffect, useCallback, useRef } from "react";
import panelStyles from "./Panel.module.scss";
import ModuleTitle from "./ModuleTitle";
import ListGroup from "react-bootstrap/ListGroup";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import WhatsWrongModal from "./whatsWrongModal";

const PredictionList = React.memo(function ({ fallbackMessage, setIsDemo }) {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  return (
    <>
      <ListGroup variant="flush" className={panelStyles.tripList}>
        <ListGroup.Item className={panelStyles.tripListItem}>
          {fallbackMessage}
        </ListGroup.Item>
        <ListGroup.Item className={panelStyles.tripListItem}>
          <Button
            className={`${panelStyles.tripButton} ${panelStyles.tripButtonWide}`}
            variant="secondary"
            onClick={handleShow}
          >
            What's wrong?
          </Button>
          <Button
            className={`${panelStyles.tripButton} ${panelStyles.tripButtonWide}`}
            variant="danger"
            onClick={() => setIsDemo(true)}
          >
            To Demo mode
          </Button>
        </ListGroup.Item>
      </ListGroup>
      <WhatsWrongModal showModal={showModal} handleClose={handleClose} />
    </>
  );
});

export default React.memo(function ({ fallbackMessage, setIsDemo }) {
  const modalContent =
    "This panel provides predictions of whether a bus will start to bunch at future stops (up to 20 stops). If a bus is predicted to start bunching at future stop, predictions will not be provided after this stop.";
  return (
    <div className={`${panelStyles.module} ${panelStyles.resultModule}`}>
      <ModuleTitle
        title={"Prediction Results"}
        modalHeading={"Prediction Results"}
        modalContent={modalContent}
      />
      <PredictionList fallbackMessage={fallbackMessage} setIsDemo={setIsDemo} />
    </div>
  );
});
