import { useState } from 'react';
import api from '../services/api';

export const usePriceCalculator = () => {
  const [calculation, setCalculation] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const calculateFinalPrice = async (organizerAmount) => {
    if (!organizerAmount || organizerAmount <= 0) {
      throw new Error('El monto debe ser mayor a 0');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/price-calculator/final-price', {
        organizer_amount: parseFloat(organizerAmount)
      });

      const result = response.data.data;
      setCalculation(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al calcular el precio';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const calculateOrganizerAmount = async (finalPrice) => {
    if (!finalPrice || finalPrice <= 0) {
      throw new Error('El precio final debe ser mayor a 0');
    }

    setLoading(true);
    setError(null);

    try {
      const response = await api.post('/price-calculator/organizer-amount', {
        final_price: parseFloat(finalPrice)
      });

      const result = response.data.data;
      setCalculation(result);
      return result;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al calcular el monto del organizador';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const getConstants = async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await api.get('/price-calculator/constants');
      return response.data.data;
    } catch (err) {
      const errorMessage = err.response?.data?.message || 'Error al obtener las constantes';
      setError(errorMessage);
      throw new Error(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const clearCalculation = () => {
    setCalculation(null);
    setError(null);
  };

  return {
    calculation,
    loading,
    error,
    calculateFinalPrice,
    calculateOrganizerAmount,
    getConstants,
    clearCalculation
  };
}; 