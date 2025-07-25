import React from 'react';
import { Link } from 'react-router-dom';
import { Card, Button } from 'react-bootstrap';
import { XCircle, ArrowLeft } from 'lucide-react';

const CancelPage = () => {
  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card className="border-0 shadow-lg">
            <Card.Body className="text-center p-5">
              <XCircle size={64} className="text-danger mb-4" />
              <h2 className="text-danger mb-3">Pago Cancelado</h2>
              <p className="text-muted mb-4">
                El proceso de pago ha sido cancelado. 
                No se ha realizado ningún cargo a tu tarjeta.
              </p>

              <div className="bg-light p-4 rounded mb-4">
                <h6 className="mb-3">¿Qué puedes hacer ahora?</h6>
                <ul className="text-start">
                  <li>Intentar el pago nuevamente</li>
                  <li>Verificar que tu información de pago sea correcta</li>
                  <li>Contactar soporte si tienes problemas</li>
                  <li>Explorar otros métodos de pago disponibles</li>
                </ul>
              </div>

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Link to="/" className="btn btn-primary d-flex align-items-center">
                  <ArrowLeft size={16} className="me-2" />
                  Volver al Inicio
                </Link>
                <Button
                  variant="outline-primary"
                  onClick={() => window.history.back()}
                >
                  Intentar Nuevamente
                </Button>
              </div>

              <div className="mt-4">
                <small className="text-muted">
                  Si tienes alguna pregunta, no dudes en contactarnos.
                </small>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default CancelPage; 