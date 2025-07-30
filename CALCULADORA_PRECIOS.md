# Calculadora de Precios - Frontend

Esta documentación explica cómo usar la calculadora de precios implementada en el frontend.

## Componentes Disponibles

### 1. PriceCalculator
Componente básico de la calculadora que se puede usar de forma independiente.

```jsx
import PriceCalculator from './components/PriceCalculator';

// Uso básico
<PriceCalculator 
    onPriceCalculated={(calculation) => {
        console.log('Precio calculado:', calculation);
    }}
    initialAmount={900}
/>
```

### 2. EventFormWithCalculator
Formulario completo de eventos que incluye la calculadora integrada.

```jsx
import EventFormWithCalculator from './components/EventFormWithCalculator';

// Uso en una página
<EventFormWithCalculator 
    onSubmit={(eventData) => {
        // eventData incluye price_calculation
        console.log('Datos del evento:', eventData);
    }}
    initialData={{
        title: 'Mi Evento',
        organizer_amount: 1000
    }}
/>
```

### 3. StandalonePriceCalculator
Versión standalone que se puede usar en cualquier lugar.

```jsx
import StandalonePriceCalculator from './components/StandalonePriceCalculator';

// Uso en un modal o sidebar
<StandalonePriceCalculator 
    onPriceSelected={(calculation) => {
        // Usar el precio calculado
        setSelectedPrice(calculation.final_price);
    }}
    className="max-w-md"
/>
```

### 4. usePriceCalculator Hook
Hook personalizado para manejar la calculadora programáticamente.

```jsx
import { usePriceCalculator } from './hooks/usePriceCalculator';

const MyComponent = () => {
    const { 
        calculation, 
        loading, 
        error, 
        calculateFinalPrice 
    } = usePriceCalculator();

    const handleCalculate = async () => {
        try {
            const result = await calculateFinalPrice(900);
            console.log('Resultado:', result);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div>
            <button onClick={handleCalculate} disabled={loading}>
                {loading ? 'Calculando...' : 'Calcular'}
            </button>
            {calculation && (
                <div>Precio final: ${calculation.final_price}</div>
            )}
        </div>
    );
};
```

## APIs Disponibles

### 1. Calcular Precio Final
```javascript
const response = await api.post('/price-calculator/final-price', {
    organizer_amount: 900
}, {
    headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
    }
});

// Respuesta:
{
    "success": true,
    "data": {
        "organizer_amount": 900,
        "final_price": 1127.68,
        "net_price": 972.14,
        "breakdown": {
            "Monto para el Organizador": 900,
            "Precio Neto de Venta (antes de IVA final)": 972.14,
            "Comisión Fija por Transacción": 34,
            "IVA (16%) de Comisión Fija": 5.44,
            "Comisión Bancaria (2.9% del Neto)": 28.19,
            "IVA (16%) de Comisión Bancaria": 4.51,
            "IVA total (16% sobre Precio Neto)": 155.54
        }
    }
}
```

### 2. Calcular Monto del Organizador
```javascript
const response = await api.post('/price-calculator/organizer-amount', {
    final_price: 1127.68
});
```

### 3. Obtener Constantes
```javascript
const response = await api.get('/price-calculator/constants');
```

## Integración en Formularios

### Ejemplo: Formulario de Tickets
```jsx
const TicketForm = () => {
    const [ticketData, setTicketData] = useState({
        name: '',
        price: 0,
        organizer_amount: 0
    });

    const handlePriceCalculated = (calculation) => {
        setTicketData(prev => ({
            ...prev,
            price: calculation.final_price,
            organizer_amount: calculation.organizer_amount
        }));
    };

    return (
        <div className="grid grid-cols-2 gap-6">
            <div>
                <h3>Información del Ticket</h3>
                <input 
                    type="text" 
                    placeholder="Nombre del ticket"
                    value={ticketData.name}
                    onChange={(e) => setTicketData(prev => ({
                        ...prev, name: e.target.value
                    }))}
                />
                <div className="mt-4">
                    <p>Precio final: ${ticketData.price}</p>
                    <p>Monto organizador: ${ticketData.organizer_amount}</p>
                </div>
            </div>
            
            <div>
                <PriceCalculator onPriceCalculated={handlePriceCalculated} />
            </div>
        </div>
    );
};
```

## Estilos CSS

Los componentes usan Bootstrap CSS. Si necesitas personalizar los estilos:

```css
/* Personalización de la calculadora */
.price-calculator {
    background-color: white;
    border-radius: 0.5rem;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
    padding: 1.5rem;
}

.price-calculator input {
    width: 100%;
    padding: 0.5rem 0.75rem;
    border: 1px solid #d1d5db;
    border-radius: 0.375rem;
}

.price-calculator button {
    background-color: #3b82f6;
    color: white;
    padding: 0.5rem 1rem;
    border-radius: 0.375rem;
    border: none;
}

.price-calculator button:hover {
    background-color: #2563eb;
}
```

## Manejo de Errores

```jsx
const { error, calculateFinalPrice } = usePriceCalculator();

const handleCalculate = async () => {
    try {
        await calculateFinalPrice(900);
    } catch (error) {
        // Mostrar error al usuario
        toast.error(error.message);
    }
};
```

## Ejemplo Completo de Integración

```jsx
import React, { useState } from 'react';
import PriceCalculator from './components/PriceCalculator';
import api from '../services/api';

const CreateEventWithPricing = () => {
    const [eventData, setEventData] = useState({
        title: '',
        description: '',
        price_info: null
    });

    const handlePriceCalculated = (calculation) => {
        setEventData(prev => ({
            ...prev,
            price_info: calculation
        }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        try {
            const response = await api.post('/events', {
                ...eventData,
                price_calculation: eventData.price_info
            });
            
            console.log('Evento creado:', response.data);
        } catch (error) {
            console.error('Error:', error);
        }
    };

    return (
        <div className="max-w-4xl mx-auto p-6">
            <form onSubmit={handleSubmit}>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div>
                        <h2>Información del Evento</h2>
                        <input 
                            type="text"
                            placeholder="Título del evento"
                            value={eventData.title}
                            onChange={(e) => setEventData(prev => ({
                                ...prev, title: e.target.value
                            }))}
                        />
                        <textarea
                            placeholder="Descripción"
                            value={eventData.description}
                            onChange={(e) => setEventData(prev => ({
                                ...prev, description: e.target.value
                            }))}
                        />
                        
                        {eventData.price_info && (
                            <div className="mt-4 p-4 bg-green-50 rounded">
                                <h3>Precio Calculado</h3>
                                <p>Final: ${eventData.price_info.final_price}</p>
                                <p>Organizador: ${eventData.price_info.organizer_amount}</p>
                            </div>
                        )}
                        
                        <button type="submit">Crear Evento</button>
                    </div>
                    
                    <div>
                        <PriceCalculator onPriceCalculated={handlePriceCalculated} />
                    </div>
                </div>
            </form>
        </div>
    );
};

export default CreateEventWithPricing;
```

## Notas Importantes

1. **Autenticación**: Todas las APIs requieren un token Bearer válido
2. **CORS**: Asegúrate de que tu backend permita peticiones desde tu frontend
3. **Validación**: Los componentes incluyen validación básica, pero puedes agregar más
4. **Responsive**: Los componentes están diseñados para ser responsive
5. **Accesibilidad**: Incluye labels y focus states apropiados

## Troubleshooting

### Error 401 Unauthorized
- Verifica que el token esté presente en localStorage
- Asegúrate de que el token no haya expirado

### Error 422 Validation Error
- Verifica que el monto sea un número válido
- Asegúrate de que el monto sea mayor a 0

### Error de CORS
- Verifica la configuración de CORS en el backend
- Asegúrate de que tu dominio esté permitido

## Archivos Implementados

1. `src/components/PriceCalculator.jsx` - Componente principal de la calculadora
2. `src/components/EventFormWithCalculator.jsx` - Formulario de eventos con calculadora integrada
3. `src/components/StandalonePriceCalculator.jsx` - Versión standalone de la calculadora
4. `src/components/PriceCalculatorExample.jsx` - Ejemplo de uso
5. `src/hooks/usePriceCalculator.js` - Hook personalizado para la calculadora
6. `src/pages/OrganizerEventsPage.jsx` - Integración en dashboard de organizador
7. `src/pages/EventsPage.jsx` - Integración en dashboard de admin

## Uso en el Sistema

La calculadora de precios está integrada en:

1. **Dashboard de Organizador**: Al crear/editar eventos
2. **Dashboard de Admin**: Al crear/editar eventos
3. **Componentes Standalone**: Para uso en otros lugares

Los datos de precio se envían automáticamente al backend cuando se crea o edita un evento, incluyendo:
- `price`: Precio final para el cliente
- `organizer_amount`: Monto que recibe el organizador
- `price_calculation`: Objeto completo con el desglose de costos 