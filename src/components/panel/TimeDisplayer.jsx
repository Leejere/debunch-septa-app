import React, { useState, useEffect } from "react";
import panelStyles from "./Panel.module.scss";
import Modal from "react-bootstrap/Modal";
import Button from "react-bootstrap/Button";

export default React.memo(function ({ isDemo }) {
  const [time, setTime] = useState(new Date());

  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setTime(new Date());
    }, 60000); // Update every minute (60,000 milliseconds)

    // Cleanup function to clear the interval when the component is unmounted
    return () => clearInterval(interval);
  }, []);

  const hour = isDemo ? 8 : time.getHours();
  const hourDisplay = (hour > 12 ? hour - 12 : hour)
    .toString()
    .padStart(2, "0");
  const minutes = isDemo ? 30 : time.getMinutes().toString().padStart(2, "0"); // Add leading zero if necessary
  const suffix = hour >= 12 ? "PM" : "AM";

  const monthName = isDemo
    ? "October"
    : time.toLocaleString("default", { month: "long" });
  const day = isDemo ? 26 : time.getDate();
  const year = isDemo ? 2022 : time.getFullYear();

  const dateTimeDisplayer = (
    <div className={panelStyles.dateTimeDisplayer}>
      <div className={panelStyles.timeDisplayer}>
        {hourDisplay}:{minutes}&nbsp;
        {suffix}
      </div>
      <div className={panelStyles.dateDisplayer}>
        {monthName}&nbsp;{day},&nbsp;{year}
      </div>
    </div>
  );

  return (
    <div className={panelStyles.module}>
      <div className={panelStyles.dateTimeWithIcon}>
        {dateTimeDisplayer}
        <span
          className={`material-symbols-outlined ${panelStyles.infoIcon}`}
          onClick={handleShow}
        >
          info
        </span>
        <Modal show={showModal} onHide={handleClose}>
          <Modal.Header closeButton>
            <Modal.Title>dd</Modal.Title>
          </Modal.Header>
          <Modal.Body>dd</Modal.Body>
          <Modal.Footer>
            <Button variant="primary" onClick={handleClose}>
              Close
            </Button>
          </Modal.Footer>
        </Modal>
      </div>
    </div>
  );
});
