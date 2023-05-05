import React, { useState, useEffect, useCallback, useRef } from "react";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";
import navStyles from "./../other-components/Nav.module.scss";

export default function whatsWrongModal({ showModal, handleClose }) {
  return (
    <Modal show={showModal} onHide={handleClose} size="lg">
      <Modal.Header closeButton>
        <Modal.Title>What could be going wrong?</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <h5 className="modalSubtitle">You haven't observed long enough</h5>
        <p>
          The model dictates that we observe a bus to pass at least three stops,
          and at least three buses passing through the same stop, to obtain all
          the metrics we need to make a prediction. This would not be a problem
          if we keep observing all the time. However, as proof-of-concept
          project, our backend cannot be continuously active. You need to wait
          at least 10 to 20 minutes after initiating observation before
          predictions become available.
        </p>
        <h5 className="modalSubtitle">
          There's a glitch with the real-time bus location API
        </h5>
        <p>
          During observation, we collect real-time bus locations every 10
          seconds from the TransitView API provided by SEPTA. If there is a
          glitch with this API, we may miss an arrival instance and therefore
          fail to make some predictions.
        </p>
        <h5 className="modalSubtitle">There's a flaw in our database</h5>
        <p>
          To make predictions, we need to associate information with each trip
          and stop. However, our database may be incomplete or outdated. Some
          information may be missing so that some trips and stops cannot be
          associated with any information, and therefore we cannot make a
          prediction.
        </p>
        <h5 className="modalSubtitle">It's not a good time</h5>
        <p>
          If you visiting during nighttime or other non-operation hours, you
          might not get any predictions for a very long time, as buses are rare
          at this moment.
        </p>
      </Modal.Body>
      <Modal.Footer>
        <Button variant="primary" onClick={handleClose}>
          Got it
        </Button>
      </Modal.Footer>
    </Modal>
  );
}
