import React, { useState } from "react";
import panelStyles from "./Panel.module.scss";
import ToggleButtonGroup from "react-bootstrap/ToggleButtonGroup";
import ToggleButton from "react-bootstrap/ToggleButton";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";
import navStyles from "../other-components/Nav.module.scss";

export default function DemoModeSetter({ isDemo, setIsDemo }) {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  return (
    <>
      <ToggleButtonGroup
        name="demoModeSetter"
        value={isDemo ? "demo" : "realtime"}
        className={panelStyles.demoModeSetter}
        onChange={() => {
          setIsDemo((prev) => !prev);
        }}
      >
        <ToggleButton
          id="demo"
          value="demo"
          variant={isDemo ? "danger" : "light"}
        >
          Demo
        </ToggleButton>
        <ToggleButton
          id="realtime"
          value="realtime"
          variant={isDemo ? "light" : "danger"}
          onClick={handleShow}
        >
          Real-time
        </ToggleButton>
      </ToggleButtonGroup>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>Manual Action Required</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          To view real-time predictions, the user needs to manually initiate
          observation as the app currently cannot maintain a continuously active
          backend. Hit the{" "}
          <span className={`${navStyles.modePlates}`}>Start Observing</span>{" "}
          button and then wait for 10 to 20 minutes before real-time predictions
          are available.
        </Modal.Body>
        <Modal.Footer>
          <Button variant="danger" onClick={handleClose}>
            <span style={{ fontWeight: "700" }}>Start Observing</span>
          </Button>
          <Button variant="primary" onClick={handleClose}>
            Got it
          </Button>
        </Modal.Footer>
      </Modal>
    </>
  );
}
