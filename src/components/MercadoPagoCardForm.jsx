import React, { useEffect, useRef, useState } from "react";
import { loadMercadoPago } from "@mercadopago/sdk-js";
import api from "../services/api";
import { Card, Button, Spinner, Alert } from 'react-bootstrap';

const PUBLIC_KEY = "TEST-59448a21-543d-4180-8e12-6b4045c37a2f";

export default function MercadoPagoCardForm({ amount, onPaymentResult }) {
  const formRef = useRef(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        await loadMercadoPago();
        
        if (!mounted) return;
        
        if (!window.MercadoPago) {
          throw new Error('SDK de Mercado Pago no se cargó correctamente');
        }
        
        const mp = new window.MercadoPago(PUBLIC_KEY, { locale: "es-MX" });

        // Verificar que los contenedores existan antes de montar el formulario
        const cardNumberContainer = document.getElementById('form-checkout__cardNumber');
        const expirationContainer = document.getElementById('form-checkout__expirationDate');
        const securityCodeContainer = document.getElementById('form-checkout__securityCode');
        
        if (!cardNumberContainer || !expirationContainer || !securityCodeContainer) {
          console.error('Contenedores no encontrados:', {
            cardNumber: !!cardNumberContainer,
            expiration: !!expirationContainer,
            securityCode: !!securityCodeContainer
          });
          if (onPaymentResult) {
            onPaymentResult({ 
              error: true, 
              message: "Error: Contenedores del formulario no encontrados. Por favor, recarga la página." 
            });
          }
          return;
        }

        // Verificar que el monto sea válido
        if (!amount || amount <= 0) {
          throw new Error('El monto debe ser mayor a 0');
        }

        mp.cardForm({
          amount: String(amount),
          autoMount: true,
          form: {
            id: "form-checkout",
            cardholderName: {
              id: "form-checkout__cardholderName",
              placeholder: "Nombre en la tarjeta",
            },
            cardholderEmail: {
              id: "form-checkout__cardholderEmail",
              placeholder: "Email",
            },
            cardNumber: {
              id: "form-checkout__cardNumber",
              placeholder: "Número de tarjeta",
            },
            expirationDate: {
              id: "form-checkout__expirationDate",
              placeholder: "MM/YY",
            },
            securityCode: {
              id: "form-checkout__securityCode",
              placeholder: "CVV",
            },
            installments: {
              id: "form-checkout__installments",
              placeholder: "Cuotas",
            },
            identificationType: {
              id: "form-checkout__identificationType",
            },
            identificationNumber: {
              id: "form-checkout__identificationNumber",
              placeholder: "DNI",
            },
            issuer: {
              id: "form-checkout__issuer",
            },
          },
          callbacks: {
            onFormMounted: (error) => {
              if (error) {
                console.error("Error al montar el formulario de tarjeta:", error);
                if (onPaymentResult) {
                  onPaymentResult({ 
                    error: true, 
                    message: "Error al cargar el formulario de pago" 
                  });
                }
              }
            },
            onSubmit: async (event) => {
              event.preventDefault();
              setLoading(true);
              
              try {
                const formData = new FormData(event.target);
                const paymentData = {
                  amount: amount,
                  description: "Compra de tickets",
                  payment_method_id: formData.get('payment_method_id'),
                  token: formData.get('token'),
                  installments: formData.get('installments'),
                  issuer_id: formData.get('issuer_id'),
                  payer: {
                    email: formData.get('cardholderEmail'),
                    identification: {
                      type: formData.get('identificationType'),
                      number: formData.get('identificationNumber')
                    }
                  }
                };

                const response = await api.post('/mercadopago/process-payment', paymentData);
                
                if (onPaymentResult) {
                  onPaymentResult(response.data);
                }
              } catch (error) {
                console.error('Error processing payment:', error);
                if (onPaymentResult) {
                  onPaymentResult({ 
                    error: true, 
                    message: error.response?.data?.message || "Error al procesar el pago" 
                  });
                }
              } finally {
                setLoading(false);
              }
            },
            onError: (error) => {
              console.error("Error en el formulario de tarjeta:", error);
              if (onPaymentResult) {
                onPaymentResult({ 
                  error: true, 
                  message: "Error en el formulario de pago" 
                });
              }
            }
          }
        });
      } catch (error) {
        console.error('Error loading MercadoPago SDK:', error);
        if (onPaymentResult) {
          onPaymentResult({ 
            error: true, 
            message: "Error al cargar el sistema de pagos" 
          });
        }
      }
    })();

    return () => {
      mounted = false;
    };
  }, [amount, onPaymentResult]);

  // Efecto adicional para limpiar el formulario cuando cambie el monto
  useEffect(() => {
    // Limpiar contenedores cuando cambie el monto
    const containers = document.querySelectorAll('#form-checkout .container');
    containers.forEach(container => {
      container.innerHTML = '';
    });
  }, [amount]);

  // Función para crear formulario alternativo con campos nativos
  const createNativeForm = () => {
    return (
      <form id="form-checkout" onSubmit={handleNativeSubmit}>
        <div className="row">
          <div className="col-md-6 mb-3">
            <input
              type="text"
              id="form-checkout__cardholderName"
              name="cardholderName"
              className="form-control"
              placeholder="Nombre en la tarjeta"
              required
            />
          </div>
          <div className="col-md-6 mb-3">
            <input
              type="email"
              id="form-checkout__cardholderEmail"
              name="cardholderEmail"
              className="form-control"
              placeholder="Email"
              required
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <div id="form-checkout__cardNumber" className="form-control"></div>
          </div>
          <div className="col-md-3 mb-3">
            <div id="form-checkout__expirationDate" className="form-control"></div>
          </div>
          <div className="col-md-3 mb-3">
            <div id="form-checkout__securityCode" className="form-control"></div>
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-4 mb-3">
            <select id="form-checkout__installments" name="installments" className="form-control" required>
              <option value="">Cuotas</option>
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <select id="form-checkout__identificationType" name="identificationType" className="form-control" required>
              <option value="">Tipo de documento</option>
            </select>
          </div>
          <div className="col-md-4 mb-3">
            <input
              type="text"
              id="form-checkout__identificationNumber"
              name="identificationNumber"
              className="form-control"
              placeholder="Número de documento"
              required
            />
          </div>
        </div>
        
        <div className="row">
          <div className="col-md-6 mb-3">
            <select id="form-checkout__issuer" name="issuer" className="form-control" required>
              <option value="">Banco emisor</option>
            </select>
          </div>
        </div>
        
        <Button type="submit" variant="primary" disabled={loading} className="w-100">
          {loading ? (
            <>
              <Spinner animation="border" size="sm" className="me-2" />
              Procesando pago...
            </>
          ) : (
            `Pagar $${amount.toFixed(2)}`
          )}
        </Button>
      </form>
    );
  };

  return (
    <Card className="bg-white text-dark shadow-lg border-0" style={{ borderRadius: 16, maxWidth: 420, margin: '0 auto' }}>
      <Card.Body>
        <h4 className="fw-bold mb-3 text-center" style={{ color: '#e50914' }}>Pago con tarjeta (Mercado Pago)</h4>
        <form id="form-checkout" ref={formRef} className="d-flex flex-column gap-3">
          <div className="row g-2">
            <div className="col-12">
              <label htmlFor="form-checkout__cardholderName" className="form-label">Nombre en la tarjeta</label>
              <input id="form-checkout__cardholderName" className="form-control bg-white text-dark border-secondary" autoComplete="off" />
            </div>
            <div className="col-12">
              <label htmlFor="form-checkout__cardholderEmail" className="form-label">Email</label>
              <input id="form-checkout__cardholderEmail" className="form-control bg-white text-dark border-secondary" autoComplete="off" />
            </div>
            <div className="col-12">
              <label htmlFor="form-checkout__cardNumber" className="form-label">Número de tarjeta</label>
              <div id="form-checkout__cardNumber" className="form-control bg-white text-dark border-secondary" style={{ minHeight: 44 }} />
            </div>
            <div className="col-6">
              <label htmlFor="form-checkout__expirationDate" className="form-label">Vencimiento</label>
              <div id="form-checkout__expirationDate" className="form-control bg-white text-dark border-secondary" style={{ minHeight: 44 }} />
            </div>
            <div className="col-6">
              <label htmlFor="form-checkout__securityCode" className="form-label">CVV</label>
              <div id="form-checkout__securityCode" className="form-control bg-white text-dark border-secondary" style={{ minHeight: 44 }} />
            </div>
            <div className="col-12">
              <label htmlFor="form-checkout__installments" className="form-label">Cuotas</label>
              <select id="form-checkout__installments" className="form-control bg-white text-dark border-secondary" style={{ minHeight: 44 }}></select>
            </div>
            <div className="col-6">
              <label htmlFor="form-checkout__identificationType" className="form-label">Tipo de documento</label>
              <div id="form-checkout__identificationType" className="form-control bg-white text-dark border-secondary" style={{ minHeight: 44 }} />
            </div>
            <div className="col-6">
              <label htmlFor="form-checkout__identificationNumber" className="form-label">Número de documento</label>
              <input id="form-checkout__identificationNumber" className="form-control bg-white text-dark border-secondary" autoComplete="off" />
            </div>
            <div className="col-12">
              <label htmlFor="form-checkout__issuer" className="form-label">Banco emisor</label>
              <select id="form-checkout__issuer" className="form-control bg-white text-dark border-secondary" style={{ minHeight: 44 }}></select>
            </div>
          </div>
          <Button type="submit" variant="danger" size="lg" className="fw-bold shadow mt-3" disabled={loading} style={{ letterSpacing: 1 }}>
            {loading ? <Spinner animation="border" size="sm" className="me-2" /> : null}
            {loading ? 'Procesando...' : 'Pagar ahora'}
          </Button>
      </form>
      </Card.Body>
    </Card>
  );
} 
