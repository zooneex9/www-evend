import React, { useState, useEffect } from 'react';
import { Container, Card, Form, Button, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Eye, EyeOff, Mail, Lock, LogIn } from 'lucide-react';

export default function LoginPage() {
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    if (user) {
      if (user.role === 'organizer') {
        navigate('/organizer-panel');
      } else if (user.role === 'client') {
        navigate('/client-panel');
      } else if (user.role === 'superadmin') {
        navigate('/');
      } else {
        navigate('/');
      }
    }
  }, [user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    try {
      await login(email, password);
      // La redirección se maneja en useEffect
    } catch (err) {
      setError('Credenciales incorrectas. Por favor, verifica tu email y contraseña.');
    }
    setLoading(false);
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center bg-white text-dark">
      <Container className="d-flex justify-content-center">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', maxWidth: 400 }}
        >
          <Card className="border-0 shadow-lg">
            <Card.Body className="p-5">
              {/* Logo */}
              <motion.div
                initial={{ scale: 0.8 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.2, duration: 0.3 }}
                className="text-center mb-4"
              >
                <img
                  src="/Domkard-White.png"
                  alt="Domkard Logo"
                  style={{ width: 120, height: 'auto' }}
                  className="mb-3"
                />
                <h2 className="text-primary fw-bold mb-0">Bienvenido</h2>
                <p className="text-muted">Inicia sesión en tu cuenta</p>
              </motion.div>

              {/* Error Alert */}
              {error && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                >
                  <Alert variant="danger" className="mb-3">
                    <div className="d-flex align-items-center">
                      <div className="me-2">⚠️</div>
                      {error}
                    </div>
                  </Alert>
                </motion.div>
              )}

              {/* Login Form */}
              <Form onSubmit={handleSubmit}>
                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.3, duration: 0.3 }}
                >
                  <Form.Group className="mb-3">
                    <Form.Label className="fw-semibold">Correo electrónico</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type="email"
                        placeholder="tu@email.com"
                        value={email}
                        onChange={e => setEmail(e.target.value)}
                        required
                        className="ps-5"
                      />
                      <Mail 
                        size={18} 
                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
                      />
                    </div>
                  </Form.Group>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.4, duration: 0.3 }}
                >
                  <Form.Group className="mb-4">
                    <Form.Label className="fw-semibold">Contraseña</Form.Label>
                    <div className="position-relative">
                      <Form.Control
                        type={showPassword ? "text" : "password"}
                        placeholder="Tu contraseña"
                        value={password}
                        onChange={e => setPassword(e.target.value)}
                        required
                        className="ps-5 pe-5"
                      />
                      <Lock 
                        size={18} 
                        className="position-absolute top-50 start-0 translate-middle-y ms-3 text-muted" 
                      />
                      <Button
                        type="button"
                        variant="link"
                        className="position-absolute top-50 end-0 translate-middle-y p-0 me-3 text-muted"
                        onClick={() => setShowPassword(!showPassword)}
                      >
                        {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                      </Button>
                    </div>
                  </Form.Group>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.5, duration: 0.3 }}
                >
                  <Button
                    type="submit"
                    variant="primary"
                    size="lg"
                    className="w-100 fw-semibold"
                    disabled={loading}
                  >
                    {loading ? (
                      <div className="d-flex align-items-center justify-content-center">
                        <div className="spinner-border spinner-border-sm me-2" role="status">
                          <span className="visually-hidden">Cargando...</span>
                        </div>
                        Iniciando sesión...
                      </div>
                    ) : (
                      <div className="d-flex align-items-center justify-content-center">
                        <LogIn size={18} className="me-2" />
                        Iniciar Sesión
                      </div>
                    )}
                  </Button>
                </motion.div>
              </Form>

              {/* Footer */}
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.6, duration: 0.3 }}
                className="text-center mt-4"
              >
                <p className="text-muted mb-0">
                  ¿No tienes cuenta?{' '}
                  <Button 
                    variant="link" 
                    className="p-0 text-primary fw-semibold"
                    onClick={() => navigate('/register')}
                  >
                    Regístrate aquí
                  </Button>
                </p>
              </motion.div>
            </Card.Body>
          </Card>
        </motion.div>
      </Container>
    </div>
  );
} 