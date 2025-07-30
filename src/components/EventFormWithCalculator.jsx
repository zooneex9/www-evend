import React, { useState } from 'react';
import { Card, Row, Col, Alert } from 'react-bootstrap';
import ModernForm from './ModernForm';
import PriceCalculator from './PriceCalculator';

const EventFormWithCalculator = ({ onSubmit, initialData = {}, loading = false, title = "Crear Evento", submitText = "Crear Evento" }) => {
  const [priceCalculation, setPriceCalculation] = useState(null);
  const [eventData, setEventData] = useState(initialData);

  const handlePriceCalculated = (calculation) => {
    setPriceCalculation(calculation);
    // Actualizar el precio del evento con el precio calculado
    setEventData(prev => ({
      ...prev,
      price: calculation.final_price,
      organizer_amount: calculation.organizer_amount
    }));
  };

  const handleSubmit = (formData) => {
    // Combinar los datos del formulario con la información de precios
    const finalData = {
      ...formData,
      price: priceCalculation?.final_price || formData.price,
      organizer_amount: priceCalculation?.organizer_amount || formData.organizer_amount,
      price_calculation: priceCalculation
    };

    if (onSubmit) {
      onSubmit(finalData);
    }
  };

  const eventFormFields = [
    {
      name: 'title',
      label: 'Título del Evento',
      type: 'text',
      required: true,
      placeholder: 'Ingresa el título del evento'
    },
    {
      name: 'description',
      label: 'Descripción',
      type: 'textarea',
      required: true,
      placeholder: 'Describe el evento'
    },
    {
      name: 'location',
      label: 'Ubicación',
      type: 'text',
      required: true,
      placeholder: 'Dirección del evento'
    },
    {
      name: 'start_date',
      label: 'Fecha y Hora de Inicio',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'end_date',
      label: 'Fecha y Hora de Fin',
      type: 'datetime-local',
      required: true
    },
    {
      name: 'main_image',
      label: 'Imagen del Evento',
      type: 'file',
      required: false,
      helpText: 'Opcional. Sube una imagen para el evento (JPG, PNG, etc.)'
    },
    {
      name: 'is_published',
      label: 'Publicar Evento',
      type: 'checkbox',
      required: false,
      helpText: 'Marque esta casilla si desea que el evento sea visible públicamente'
    }
  ];

  return (
    <Row>
      <Col lg={7}>
        <Card className="shadow-sm border-0">
          <Card.Body>
            <h4 className="fw-bold mb-4">{title}</h4>
            
            {priceCalculation && (
              <Alert variant="success" className="mb-4">
                <div className="d-flex justify-content-between align-items-center">
                  <div>
                    <strong>Precio Calculado:</strong> ${priceCalculation.final_price.toFixed(2)} MXN
                  </div>
                  <div>
                    <small>Organizador recibe: ${priceCalculation.organizer_amount.toFixed(2)} MXN</small>
                  </div>
                </div>
              </Alert>
            )}

            <ModernForm
              fields={eventFormFields}
              initialData={eventData}
              submitText={submitText}
              cancelText="Cancelar"
              onSubmit={handleSubmit}
              loading={loading}
              layout="vertical"
            />
          </Card.Body>
        </Card>
      </Col>
      
      <Col lg={5}>
        <PriceCalculator 
          onPriceCalculated={handlePriceCalculated}
          initialAmount={initialData.organizer_amount || 0}
          className="sticky-top"
          style={{ top: '20px' }}
        />
      </Col>
    </Row>
  );
};

export default EventFormWithCalculator; 