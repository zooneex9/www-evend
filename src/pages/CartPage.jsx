import React from 'react';
import { Container, Card } from 'react-bootstrap';

export default function CartPage() {
  return (
    <Container className="py-5">
      <Card className="shadow border-0 mx-auto" style={{ maxWidth: 500 }}>
        <Card.Body>
          <h2 className="fw-bold mb-3 text-center" style={{ color: '#e50914' }}>Mi Carrito</h2>
          <div className="text-center text-muted">Tu carrito está vacío.</div>
        </Card.Body>
      </Card>
    </Container>
  );
} 