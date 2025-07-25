import React, { useState } from 'react';
import { Card, Button, Alert, Spinner } from 'react-bootstrap';
import { loadStripe } from '@stripe/stripe-js';
import api from '../services/api';
import toast from 'react-hot-toast';

const stripePromise = loadStripe(import.meta.env.VITE_STRIPE_PUBLISHABLE_KEY);

const StripePaymentForm = ({ ticket, event, quantity, onSuccess, onCancel }) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handlePayment = async () => {
    setLoading(true);
    setError(null);

    try {
      // Crear sesión de Stripe
      const response = await api.post('/stripe/session', {
        ticket_id: ticket.id,
        ticket_name: ticket.name,
        ticket_price: ticket.price,
        quantity: quantity,
        event_id: event.id,
        user_id: localStorage.getItem('user_id'), // Obtener del contexto de auth
      });

      if (response.data.url) {
        // Redirigir a Stripe Checkout
        window.location.href = response.data.url;
      } else {
        throw new Error('No se pudo crear la sesión de pago');
      }
    } catch (err) {
      console.error('Error al procesar pago:', err);
      setError('Error al procesar el pago. Por favor, intenta nuevamente.');
      toast.error('Error al procesar el pago');
    } finally {
      setLoading(false);
    }
  };

  const totalAmount = ticket.price * quantity;

  return (
    <Card className="border-0 shadow-sm">
      <Card.Header className="bg-primary text-white">
        <h5 className="mb-0">Pago con Tarjeta (Stripe)</h5>
      </Card.Header>
      <Card.Body>
        <div className="mb-3">
          <h6>Resumen de compra:</h6>
          <div className="d-flex justify-content-between">
            <span>{ticket.name} x {quantity}</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
          <div className="d-flex justify-content-between fw-bold">
            <span>Total:</span>
            <span>${totalAmount.toFixed(2)}</span>
          </div>
        </div>

        {error && (
          <Alert variant="danger" className="mb-3">
            {error}
          </Alert>
        )}

        <div className="d-grid gap-2">
          <Button
            variant="primary"
            onClick={handlePayment}
            disabled={loading}
            className="d-flex align-items-center justify-content-center"
          >
            {loading ? (
              <>
                <Spinner size="sm" animation="border" className="me-2" />
                Procesando...
              </>
            ) : (
              <>
                💳 Pagar ${totalAmount.toFixed(2)}
              </>
            )}
          </Button>
          
          <Button
            variant="outline-secondary"
            onClick={onCancel}
            disabled={loading}
          >
            Cancelar
          </Button>
        </div>

        <div className="mt-3">
          <small className="text-muted">
            Tu pago será procesado de forma segura por Stripe.
            <br />
            Recibirás una confirmación por email una vez completado el pago.
          </small>
        </div>
      </Card.Body>
    </Card>
  );
};

export default StripePaymentForm; 