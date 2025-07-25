import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Card, Button, Alert } from 'react-bootstrap';
import { CheckCircle, Download, Mail } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

const SuccessPage = () => {
  const [searchParams] = useSearchParams();
  const [purchaseDetails, setPurchaseDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    if (sessionId) {
      // Consultar la API para obtener detalles reales de la compra
      api.get(`/ticket-purchases?stripe_session_id=${sessionId}`)
        .then(res => {
          if (res.data && res.data.length > 0) {
            const compra = res.data[0];
            setPurchaseDetails({
              ticketName: compra.ticket_name,
              eventTitle: compra.event_title,
              quantity: compra.quantity,
              amount: compra.amount,
              purchaseDate: new Date(compra.created_at).toLocaleString(),
              ticketId: compra.ticket_id,
              status: compra.status
            });
          } else {
            setPurchaseDetails(null);
          }
          setLoading(false);
        })
        .catch(() => {
          setPurchaseDetails(null);
          setLoading(false);
        });
    } else {
      setLoading(false);
    }
  }, [sessionId]);

  const handleDownloadTicket = () => {
    // Aquí implementarías la descarga del ticket
    toast.success('Descargando ticket...');
  };

  const handleSendEmail = () => {
    // Aquí implementarías el envío por email
    toast.success('Ticket enviado por email');
  };

  if (loading) {
    return (
      <div className="container py-5">
        <div className="text-center">
          <div className="spinner-border text-primary" role="status">
            <span className="visually-hidden">Cargando...</span>
          </div>
          <p className="mt-3">Verificando tu pago...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container py-5">
      <div className="row justify-content-center">
        <div className="col-md-8 col-lg-6">
          <Card className="border-0 shadow-lg">
            <Card.Body className="text-center p-5">
              <CheckCircle size={64} className="text-success mb-4" />
              <h2 className="text-success mb-3">¡Pago Exitoso!</h2>
              <p className="text-muted mb-4">
                Tu pago ha sido procesado correctamente. 
                Recibirás una confirmación por email.
              </p>

              {purchaseDetails && (
                <div className="bg-light p-4 rounded mb-4">
                  <h6 className="mb-3">Detalles de la compra:</h6>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Evento:</strong>
                    </div>
                    <div className="col-6">
                      {purchaseDetails.eventTitle}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Ticket:</strong>
                    </div>
                    <div className="col-6">
                      {purchaseDetails.ticketName}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Cantidad:</strong>
                    </div>
                    <div className="col-6">
                      {purchaseDetails.quantity}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Total:</strong>
                    </div>
                    <div className="col-6">
                      ${purchaseDetails.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>ID de Ticket:</strong>
                    </div>
                    <div className="col-6">
                      <code>{purchaseDetails.ticketId}</code>
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Fecha:</strong>
                    </div>
                    <div className="col-6">
                      {purchaseDetails.purchaseDate}
                    </div>
                  </div>
                </div>
              )}

              <div className="d-grid gap-2 d-md-flex justify-content-md-center">
                <Button
                  variant="outline-primary"
                  onClick={handleDownloadTicket}
                  className="d-flex align-items-center"
                >
                  <Download size={16} className="me-2" />
                  Descargar Ticket
                </Button>
                <Button
                  variant="outline-secondary"
                  onClick={handleSendEmail}
                  className="d-flex align-items-center"
                >
                  <Mail size={16} className="me-2" />
                  Enviar por Email
                </Button>
              </div>

              <div className="mt-4">
                <Link to="/" className="btn btn-primary">
                  Volver al Inicio
                </Link>
              </div>
            </Card.Body>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default SuccessPage; 