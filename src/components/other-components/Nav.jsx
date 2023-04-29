import React, { useState } from "react";
import septaLogo from "../../assets/septa-logo.png";
import headerPicture from "../../assets/header-picture.png";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import navStyles from "./Nav.module.scss";

const ModalText = () => {
  return (
    <>
      <h5 className="modalSubtitle">Frequency is freedom</h5>
      <p>
        Knowing when buses are coming, riders plan their trips without stress.
        But disruptions occur and affect some buses more than others, leading to{" "}
        <strong>bunching</strong>, where two buses arrive at a stop
        consecutively, accompanied by
        <strong>gapping</strong>, where riders have to wait a long time after
        the last bus left. This should not happen too often to a reliable bus
        service.
      </p>
      <h5 className="modalSubtitle">What this is</h5>
      <p></p>
    </>
  );
};

export default function Nav() {
  const [showModal, setShowModal] = useState(true);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const appName = "Will It Bunch?";
  return (
    <nav className={navStyles.nav}>
      <div className={navStyles.bar}>
        <h1 className={navStyles.appName}>{appName}</h1>
        <img className={navStyles.headerPicture} src={headerPicture} />
        <span
          className={`material-symbols-outlined ${navStyles.infoIcon}`}
          onClick={handleShow}
        >
          info
        </span>
      </div>
      <Modal
        show={showModal}
        onHide={handleClose}
        size="lg"
        dialogClassName={navStyles.wideModal}
      >
        <Modal.Header closeButton>
          <Modal.Title className="modalTitle">SEPTA, Debunched</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModalText />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Explore
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
}
