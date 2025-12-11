import React from "react";
import { Modal, Button } from "react-bootstrap";

export default function CompanyChoiceModal({ show, onCreate, onJoin }) {
  return (
    <Modal show={show} centered backdrop="static" keyboard={false}>
      <Modal.Header>
        <Modal.Title>Welcome! Choose an option</Modal.Title>
      </Modal.Header>
      <Modal.Body>
        <p>You need to create or join a company to continue.</p>
        <div className="d-flex justify-content-around">
          <Button variant="primary" onClick={onCreate}>
            Create Company
          </Button>
          <Button variant="secondary" onClick={onJoin}>
            Join Company
          </Button>
        </div>
      </Modal.Body>
    </Modal>
  );
}
