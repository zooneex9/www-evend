import React, { useState } from 'react';
import { Card, Form, Button, Alert } from 'react-bootstrap';
import api from '../services/api';
import toast from 'react-hot-toast';

const PriceCalculator = ({ onPriceCalculated, initialAmount = 0, className = '' }) => {
  const [organizerAmount, setOrganizerAmount] = useState(initialAmount);
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleCalculate = async (e) => {
    e.preventDefault();
    
    if (!organizerAmount || organizerAmount <= 0) {
      toast.error('Por favor ingresa un monto válido');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/price-calculator/final-price', {
        organizer_amount: parseFloat(organizerAmount)
      });

      const result = response.data.data;
      setCalculation(result);
      
      if (onPriceCalculated) {
        onPriceCalculated(result);
      }

      toast.success('Precio calculado exitosamente');
    } catch (err) {
      console.error('Error calculando precio:', err);
      setError(err.response?.data?.message || 'Error al calcular el precio');
      toast.error('Error al calcular el precio');
    } finally {
      setLoading(false);
    }
  };

  // Función helper para obtener valores seguros
  const getSafeValue = (obj, key, defaultValue = 0) => {
    if (!obj || !obj[key]) return defaultValue;
    const value = obj[key];
    return typeof value === 'number' ? value : defaultValue;
  };

  return (
    <Card className={`shadow-sm border-0 ${className}`}>
      <Card.Body>
        <h5 className="fw-bold mb-3 text-primary">Calculadora de Precio de Boleto</h5>
        
        <Form onSubmit={handleCalculate}>
          <Form.Group className="mb-3">
            <Form.Label className="fw-bold">
              Monto que el organizador desea recibir (MXN):
            </Form.Label>
            <Form.Control
              type="number"
              value={organizerAmount}
              onChange={(e) => setOrganizerAmount(e.target.value)}
              placeholder="Ej: 600"
              min="0"
              step="0.01"
              required
            />
          </Form.Group>

          <Button 
            type="submit" 
            variant="primary" 
            className="w-100 mb-3"
            disabled={loading}
          >
            {loading ? 'Calculando...' : 'Calcular Precio Final'}
          </Button>
        </Form>

        {error && (
          <Alert variant="danger" className="mt-3">
            {error}
          </Alert>
        )}

        {calculation && calculation.final_price && (
          <div className="mt-4">
            <div className="bg-success bg-opacity-10 p-3 rounded mb-3">
              <h6 className="fw-bold text-success mb-0">
                Precio Final del Boleto: ${getSafeValue(calculation, 'final_price').toFixed(2)} MXN
              </h6>
            </div>

            <div className="bg-light p-3 rounded">
              <h6 className="fw-bold text-primary mb-3">Desglose estimado del cálculo:</h6>
              
              <div className="row mb-2">
                <div className="col-8">
                  <small>Monto para Organizador:</small>
                </div>
                <div className="col-4 text-end">
                  <small className="fw-bold">${getSafeValue(calculation?.breakdown, 'Monto para Organizador').toFixed(2)}</small>
                </div>
              </div>
              
              <div className="row mb-2">
                <div className="col-8">
                  <small>Comisión Evend ($30) + IVA:</small>
                </div>
                <div className="col-4 text-end">
                  <small className="fw-bold">${getSafeValue(calculation?.breakdown, 'Comisión Evend ($30) + IVA').toFixed(2)}</small>
                </div>
              </div>
              
              <div className="row mb-2">
                <div className="col-8">
                  <small>Subtotal 1:</small>
                </div>
                <div className="col-4 text-end">
                  <small className="fw-bold">${getSafeValue(calculation?.breakdown, 'Subtotal 1').toFixed(2)}</small>
                </div>
              </div>
              
              <div className="row mb-2">
                <div className="col-8">
                  <small>IVA General (16%) sobre Subtotal 1:</small>
                </div>
                <div className="col-4 text-end">
                  <small className="fw-bold">${getSafeValue(calculation?.breakdown, 'IVA General (16%) sobre Subtotal 1').toFixed(2)}</small>
                </div>
              </div>
              
              <div className="row mb-2">
                <div className="col-8">
                  <small>Subtotal 2 (Base para Comisión):</small>
                </div>
                <div className="col-4 text-end">
                  <small className="fw-bold">${getSafeValue(calculation?.breakdown, 'Subtotal 2 (Base para Comisión)').toFixed(2)}</small>
                </div>
              </div>
              
              <div className="row mb-2">
                <div className="col-8">
                  <small>Comisión Transacción Bancaria + IVA:</small>
                </div>
                <div className="col-4 text-end">
                  <small className="fw-bold">${getSafeValue(calculation?.breakdown, 'Comisión Transacción Bancaria + IVA').toFixed(2)}</small>
                </div>
              </div>
              
              <div className="row mb-2">
                <div className="col-8">
                  <small>Precio Final del Boleto:</small>
                </div>
                <div className="col-4 text-end">
                  <small className="fw-bold">${getSafeValue(calculation?.breakdown, 'Precio Final del Boleto').toFixed(2)}</small>
                </div>
              </div>
            </div>

            <div className="mt-3">
              <small className="text-muted">
                Este cálculo es una estimación. Se basa en una comisión Evend de $30.00 MXN y una comisión de transacción bancaria del 3.6% + $3.00 MXN, aplicando un 16% de IVA en los pasos correspondientes. Los montos finales pueden variar por redondeos.
              </small>
            </div>
          </div>
        )}
      </Card.Body>
    </Card>
  );
};

export default PriceCalculator;