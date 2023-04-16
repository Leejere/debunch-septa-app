import React, { useState } from "react";
import septaLogo from "../../assets/septa-logo.png";
import headerPicture from "../../assets/header-picture.png";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

import navStyles from "./Nav.module.scss";

export default function Nav() {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);

  const appName = "Will It Bunch?";
  return (
    <nav className={navStyles.nav}>
      <img className={navStyles.logo} src={septaLogo} />
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
          <Modal.Title>Modal heading</Modal.Title>
        </Modal.Header>
        <Modal.Body>Woohoo, you're reading this text in a modal!</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Close
          </Button>
        </Modal.Footer>
      </Modal>
    </nav>
  );
}
