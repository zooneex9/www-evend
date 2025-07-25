import React, { useState } from 'react';
import api from '../services/api';
import { Card, Button, Form, Spinner, Alert } from 'react-bootstrap';

export default function UserForm({ onCreated }) {
  const [form, setForm] = useState({
    name: '',
    email: '',
    password: '',
    password_confirmation: '',
  });
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await api.post('/users', form);
      setForm({
        name: '',
        email: '',
        password: '',
        password_confirmation: '',
      });
      if (onCreated) onCreated();
    } catch (err) {
      setError(err.response?.data?.message || 'Error al crear usuario');
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="bg-white text-dark border-0 shadow-sm mb-4" style={{ maxWidth: 500 }}>
      <Card.Body>
        <h5 className="fw-bold mb-3">Alta de Usuario</h5>
        <Form onSubmit={handleSubmit} autoComplete="off">
          <Form.Group className="mb-3" controlId="userName">
            <Form.Label className="text-white">Nombre</Form.Label>
            <Form.Control
              type="text"
              name="name"
              value={form.name}
              onChange={handleChange}
              required
              className="bg-white text-dark border-secondary rounded-pill"
              placeholder="Nombre completo"
              autoComplete="off"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userEmail">
            <Form.Label className="text-white">Email</Form.Label>
            <Form.Control
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              required
              className="bg-white text-dark border-secondary rounded-pill"
              placeholder="correo@dominio.com"
              autoComplete="off"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userPassword">
            <Form.Label className="text-white">Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              required
              className="bg-white text-dark border-secondary rounded-pill"
              placeholder="Contraseña"
              autoComplete="new-password"
            />
          </Form.Group>
          <Form.Group className="mb-3" controlId="userPasswordConfirm">
            <Form.Label className="text-white">Confirmar Contraseña</Form.Label>
            <Form.Control
              type="password"
              name="password_confirmation"
              value={form.password_confirmation}
              onChange={handleChange}
              required
              className="bg-white text-dark border-secondary rounded-pill"
              placeholder="Repite la contraseña"
              autoComplete="new-password"
            />
          </Form.Group>
          <div className="d-flex justify-content-end">
            <Button type="submit" variant="primary" className="rounded-pill px-4" disabled={loading}>
              {loading ? <Spinner size="sm" animation="border" className="me-2" /> : null}
              Crear usuario
            </Button>
          </div>
          {error && <Alert variant="danger" className="mt-3">{error}</Alert>}
        </Form>
      </Card.Body>
    </Card>
  );
} 