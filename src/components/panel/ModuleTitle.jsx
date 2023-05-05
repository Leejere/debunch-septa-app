import React, { useState } from "react";
import panelStyles from "./Panel.module.scss";
import Button from "react-bootstrap/Button";
import Modal from "react-bootstrap/Modal";

export default React.memo(function ({
  title,
  titleHeavyPart,
  modalHeading,
  modalContent,
}) {
  const [showModal, setShowModal] = useState(false);
  const handleClose = () => setShowModal(false);
  const handleShow = () => setShowModal(true);
  return (
    <div className={panelStyles.moduleTitle}>
      <h5>
        {title}&nbsp;
        <span className={panelStyles.moduleTitleHeavy}>{titleHeavyPart}</span>
      </h5>
      <span
        className={`material-symbols-outlined ${panelStyles.infoIcon}`}
        onClick={handleShow}
      >
        info
      </span>
      <Modal show={showModal} onHide={handleClose}>
        <Modal.Header closeButton>
          <Modal.Title>{modalHeading}</Modal.Title>
        </Modal.Header>
        <Modal.Body>{modalContent}</Modal.Body>
        <Modal.Footer>
          <Button variant="primary" onClick={handleClose}>
            Got it
          </Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
});
