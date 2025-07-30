import React, { useState } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import StandalonePriceCalculator from './StandalonePriceCalculator';

const PriceCalculatorExample = () => {
  const [selectedPrice, setSelectedPrice] = useState(null);

  const handlePriceSelected = (calculation) => {
    setSelectedPrice(calculation);
  };

  return (
    <div className="container py-4">
      <h2 className="mb-4">Ejemplo de Calculadora de Precios</h2>
      
      <Row>
        <Col lg={8}>
          <Card className="shadow-sm border-0">
            <Card.Body>
              <h4 className="fw-bold mb-3">Información del Evento</h4>
              
              {selectedPrice && (
                <Alert variant="success" className="mb-4">
                  <div className="d-flex justify-content-between align-items-center">
                    <div>
                      <strong>Precio Final Calculado:</strong> ${selectedPrice.final_price.toFixed(2)} MXN
                    </div>
                    <div>
                      <small>Organizador recibe: ${selectedPrice.organizer_amount.toFixed(2)} MXN</small>
                    </div>
                  </div>
                </Alert>
              )}
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Título del Evento</label>
                    <input type="text" className="form-control" placeholder="Ej: Conferencia de Tecnología" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Ubicación</label>
                    <input type="text" className="form-control" placeholder="Ej: Centro de Convenciones" />
                  </div>
                </div>
              </div>
              
              <div className="mb-3">
                <label className="form-label fw-bold">Descripción</label>
                <textarea className="form-control" rows="3" placeholder="Describe tu evento..."></textarea>
              </div>
              
              <div className="row">
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Fecha de Inicio</label>
                    <input type="datetime-local" className="form-control" />
                  </div>
                </div>
                <div className="col-md-6">
                  <div className="mb-3">
                    <label className="form-label fw-bold">Fecha de Fin</label>
                    <input type="datetime-local" className="form-control" />
                  </div>
                </div>
              </div>
              
              <button className="btn btn-primary" disabled={!selectedPrice}>
                {selectedPrice ? 'Crear Evento con Precio Calculado' : 'Calcula un precio primero'}
              </button>
            </Card.Body>
          </Card>
        </Col>
        
        <Col lg={4}>
          <StandalonePriceCalculator 
            onPriceSelected={handlePriceSelected}
            title="Calculadora de Precios"
            className="sticky-top"
            style={{ top: '20px' }}
          />
        </Col>
      </Row>
    </div>
  );
};

export default PriceCalculatorExample; 