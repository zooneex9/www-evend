import React from 'react';
import PriceCalculator from './PriceCalculator';

const StandalonePriceCalculator = ({ onPriceSelected, className = '', title = "Calculadora de Precios" }) => {
  const handlePriceCalculated = (calculation) => {
    if (onPriceSelected) {
      onPriceSelected(calculation);
    }
  };

  return (
    <div className={className}>
      <h4 className="fw-bold mb-3">{title}</h4>
      <PriceCalculator 
        onPriceCalculated={handlePriceCalculated}
        className="border-0"
      />
    </div>
  );
};

export default StandalonePriceCalculator; 