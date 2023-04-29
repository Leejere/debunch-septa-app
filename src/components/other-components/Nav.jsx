import React, { useState } from "react";
import septaLogo from "../../assets/septa-logo.png";
import headerPicture from "../../assets/header-picture.png";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import navStyles from "./Nav.module.scss";

const ModalText = () => {
  return (
    <>
      <h5>What is the project?</h5>
    </>
  );
};

export default function Nav() {
  const [showModal, setShowModal] = useState(false);
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
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title className="modalTitle">SEPTA, Debunched</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <ModalText />
        </Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
}
