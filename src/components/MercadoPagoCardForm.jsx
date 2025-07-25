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
        console.log('Iniciando carga del SDK de Mercado Pago...');
      await loadMercadoPago();
        
      if (!mounted) return;
        
        console.log('SDK cargado, verificando window.MercadoPago...');
        if (!window.MercadoPago) {
          throw new Error('SDK de Mercado Pago no se cargó correctamente');
        }
        
      const mp = new window.MercadoPago(PUBLIC_KEY, { locale: "es-MX" });
        console.log('Instancia de MercadoPago creada:', mp);

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

      console.log('Contenedores encontrados, montando formulario...');

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
              console.warn("Error al montar el formulario de tarjeta:", error);
              if (onPaymentResult) {
                onPaymentResult({ 
                  error: true, 
                  message: "Error al cargar el formulario de pago. Por favor, recarga la página." 
                });
              }
            } else {
              console.log("Formulario de tarjeta montado correctamente");
              
              // Verificar que los iframes se hayan creado correctamente
              setTimeout(() => {
                const iframes = document.querySelectorAll('#form-checkout .container iframe');
                console.log('Iframes encontrados:', iframes.length);
                iframes.forEach((iframe, index) => {
                  console.log(`Iframe ${index}:`, iframe);
                  console.log(`Iframe ${index} pointer-events:`, getComputedStyle(iframe).pointerEvents);
                  
                  // Forzar que los iframes sean interactivos
                  iframe.style.pointerEvents = 'auto';
                  iframe.style.zIndex = '1000';
                  iframe.style.position = 'relative';
                  
                  // Verificar si el iframe tiene contenido
                  try {
                    if (iframe.contentDocument) {
                      console.log(`Iframe ${index} tiene contenido`);
                    }
                  } catch (e) {
                    console.log(`Iframe ${index} no permite acceso al contenido (normal)`);
                  }
                });
                
                // Verificar contenedores
                const containers = document.querySelectorAll('#form-checkout .container');
                containers.forEach((container, index) => {
                  console.log(`Contenedor ${index}:`, container);
                  console.log(`Contenedor ${index} pointer-events:`, getComputedStyle(container).pointerEvents);
                  container.style.pointerEvents = 'auto';
                  container.style.zIndex = '1';
                });
              }, 1000);
            }
          },
          onSubmit: async (event) => {
            event.preventDefault();
            setLoading(true);
            
            try {
              const {
                paymentMethodId: payment_method_id,
                issuerId: issuer_id,
                cardholderEmail: email,
                amount: formAmount,
                token,
                installments,
                identificationNumber,
                identificationType,
              } = mp.cardForm().getCardFormData();

              // Validaciones adicionales
              if (!token || !payment_method_id || !email) {
                throw new Error("Por favor, completa todos los campos requeridos");
              }

              console.log("Enviando pago al servidor...");
              const res = await api.post("/mercadopago/card-payment", {
                token,
                issuer_id,
                payment_method_id,
                transaction_amount: Number(formAmount),
                installments: Number(installments),
                description: "Compra de ticket",
                payer: {
                  email,
                  identification: {
                    type: identificationType,
                    number: identificationNumber,
                  },
                },
              });

              console.log("Respuesta del servidor:", res.data);
              
              if (onPaymentResult) onPaymentResult(res.data);
              
              if (res.data.status === 'approved' || res.data.status === 'pending') {
                alert("¡Pago procesado correctamente! Estado: " + res.data.status);
              } else {
                alert("Pago procesado. Estado: " + res.data.status + "\nDetalles: " + res.data.status_detail);
              }
            } catch (err) {
              console.error("Error en el pago:", err);
              const errorMessage = err.response?.data?.message || err.message || "Error desconocido al procesar el pago";
              alert("Error al procesar el pago: " + errorMessage);
              if (onPaymentResult) onPaymentResult({ error: true, message: errorMessage });
            } finally {
              setLoading(false);
            }
          },
          onError: (error) => {
            console.error("Error en el formulario de tarjeta:", error);
              
              // Manejo más robusto del error
              let errorMessage = "Error desconocido en el formulario de pago";
              
              if (error && typeof error === 'object') {
                if (error.message) {
                  errorMessage = error.message;
                } else if (error.error) {
                  errorMessage = error.error;
                } else if (error.description) {
                  errorMessage = error.description;
                }
              } else if (typeof error === 'string') {
                errorMessage = error;
              }
              
              console.log("Error detallado:", {
                error,
                type: typeof error,
                keys: error ? Object.keys(error) : 'no error object'
              });
              
            if (onPaymentResult) {
              onPaymentResult({ 
                error: true, 
                  message: "Error en el formulario: " + errorMessage 
              });
            }
          },
        },
      });
      } catch (error) {
        console.error('Error al inicializar Mercado Pago:', error);
        if (onPaymentResult) {
          onPaymentResult({ 
            error: true, 
            message: "Error al inicializar el sistema de pago: " + error.message 
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
    console.log('Creando formulario nativo como alternativa...');
    
    // Limpiar contenedores
    const containers = document.querySelectorAll('#form-checkout .container');
    containers.forEach(container => {
      container.innerHTML = '';
    });
    
    // Crear campos nativos
    const cardNumberContainer = document.getElementById('form-checkout__cardNumber');
    const expirationContainer = document.getElementById('form-checkout__expirationDate');
    const securityCodeContainer = document.getElementById('form-checkout__securityCode');
    
    if (cardNumberContainer) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'Número de tarjeta';
      input.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #333; border-radius: 4px; font-size: 12px;';
      cardNumberContainer.appendChild(input);
    }
    
    if (expirationContainer) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'MM/YY';
      input.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #333; border-radius: 4px; font-size: 12px;';
      expirationContainer.appendChild(input);
    }
    
    if (securityCodeContainer) {
      const input = document.createElement('input');
      input.type = 'text';
      input.placeholder = 'CVV';
      input.style.cssText = 'width: 100%; padding: 8px; border: 1px solid #333; border-radius: 4px; font-size: 12px;';
      securityCodeContainer.appendChild(input);
    }
    
    alert('Formulario nativo creado. Nota: Este es un fallback y no incluye validación de tarjeta en tiempo real.');
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
