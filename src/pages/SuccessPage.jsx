import React, { useEffect, useState } from 'react';
import { useSearchParams, Link, useNavigate } from 'react-router-dom';
import { Card, Button, Alert } from 'react-bootstrap';
import { CheckCircle, Download, Mail } from 'lucide-react';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function SuccessPage() {
  const [details, setDetails] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [retry, setRetry] = useState(0);
  const navigate = useNavigate();

  useEffect(() => {
    const sessionId = new URLSearchParams(window.location.search).get('session_id');
    
    if (!sessionId) {
      setError('No se encontró información de la sesión');
      setLoading(false);
      return;
    }

    const fetchPurchaseDetails = async () => {
      try {
        const res = await api.get(`/purchases?session_id=${sessionId}`);
        
        if (res.data && res.data.length > 0) {
          setDetails(res.data[0]);
          setLoading(false);
        } else {
          // Intentar obtener información de Stripe
          try {
            const stripeRes = await api.get(`/stripe/session/${sessionId}`);
            if (stripeRes.data) {
              setDetails({
                session_id: sessionId,
                amount: stripeRes.data.amount_total / 100,
                status: 'completed',
                created_at: new Date().toISOString()
              });
              setLoading(false);
            } else {
              setError('No se encontró información de la compra');
              setLoading(false);
            }
          } catch (stripeErr) {
            console.error('Error fetching Stripe session:', stripeErr);
            setError('No se pudo verificar el estado de la compra');
            setLoading(false);
          }
        }
      } catch (err) {
        console.error('Error fetching purchase details:', err);
        
        if (retry < 3) {
          setTimeout(() => {
            setRetry(prev => prev + 1);
          }, 3000);
        } else {
          setError('No se pudo cargar la información de la compra');
          setLoading(false);
        }
      }
    };

    fetchPurchaseDetails();
  }, [retry]);

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
          <p className="mt-3">
            {retry > 0 ? `Verificando tu pago... (intento ${retry + 1})` : 'Verificando tu pago...'}
          </p>
          {retry > 0 && (
            <p className="text-muted small">
              Esto puede tomar unos segundos mientras se procesa el pago.
            </p>
          )}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container py-5">
        <div className="row justify-content-center">
          <div className="col-md-8 col-lg-6">
            <Card className="border-0 shadow-lg">
              <Card.Body className="text-center p-5">
                <Alert variant="warning">
                  <h4>⚠️ Advertencia</h4>
                  <p>{error}</p>
                  <p className="mb-0">
                    Si realizaste un pago, por favor contacta soporte con el siguiente ID de sesión:
                    <br />
                    <code>{sessionId || 'No disponible'}</code>
                  </p>
                </Alert>
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

              {details && (
                <div className="bg-light p-4 rounded mb-4">
                  <h6 className="mb-3">Detalles de la compra:</h6>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Evento:</strong>
                    </div>
                    <div className="col-6">
                      {details.event_title || 'N/A'}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Ticket:</strong>
                    </div>
                    <div className="col-6">
                      {details.ticket_name || 'N/A'}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Cantidad:</strong>
                    </div>
                    <div className="col-6">
                      {details.quantity || 1}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Total:</strong>
                    </div>
                    <div className="col-6">
                      ${details.amount.toFixed(2)}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>ID de Ticket:</strong>
                    </div>
                    <div className="col-6">
                      <code>{details.ticket_id || 'N/A'}</code>
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Fecha:</strong>
                    </div>
                    <div className="col-6">
                      {new Date(details.created_at).toLocaleString()}
                    </div>
                  </div>
                  <div className="row text-start">
                    <div className="col-6">
                      <strong>Estado:</strong>
                    </div>
                    <div className="col-6">
                      <span className="badge bg-success">{details.status}</span>
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