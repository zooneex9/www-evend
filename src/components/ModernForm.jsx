import React, { useState, useEffect } from 'react';
import { Form, Button, Card, Row, Col, Alert } from 'react-bootstrap';
import { motion } from 'framer-motion';
import { Save, X, Plus, Trash2 } from 'lucide-react';

const ModernForm = ({
  fields = [],
  initialData = {},
  onSubmit,
  onCancel,
  title = "Formulario",
  submitText = "Guardar",
  cancelText = "Cancelar",
  loading = false,
  validation = {},
  layout = "vertical" // vertical, horizontal, grid
}) => {
  const [formData, setFormData] = useState(initialData);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    if (fields && fields.length > 0) {
      setFormData(initialData || {});
    }
  }, [fields, initialData]);

  const handleChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));

    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  const handleBlur = (field) => {
    setTouched(prev => ({
      ...prev,
      [field]: true
    }));

    // Validate field on blur
    validateField(field, formData[field]);
  };

  const validateField = (field, value) => {
    const fieldValidation = validation[field];
    if (!fieldValidation) return null;

    let error = null;

    if (fieldValidation.required && !value) {
      error = 'Este campo es requerido';
    } else if (fieldValidation.minLength && value && value.length < fieldValidation.minLength) {
      error = `Mínimo ${fieldValidation.minLength} caracteres`;
    } else if (fieldValidation.maxLength && value && value.length > fieldValidation.maxLength) {
      error = `Máximo ${fieldValidation.maxLength} caracteres`;
    } else if (fieldValidation.pattern && value && !fieldValidation.pattern.test(value)) {
      error = fieldValidation.message || 'Formato inválido';
    } else if (fieldValidation.custom) {
      error = fieldValidation.custom(value, formData);
    }

    setErrors(prev => ({
      ...prev,
      [field]: error
    }));

    return error;
  };

  const validateForm = () => {
    const newErrors = {};
    let isValid = true;

    fields.forEach(field => {
      const error = validateField(field.name, formData[field.name]);
      if (error) {
        newErrors[field.name] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    if (validateForm()) {
      onSubmit(formData);
    }
  };

  const renderField = (field) => {
    const {
      name,
      label,
      type = 'text',
      placeholder,
      options = [],
      required = false,
      disabled = false,
      helpText,
      ...fieldProps
    } = field;

    const fieldError = errors[name];
    const isTouched = touched[name];
    const showError = fieldError && isTouched;

    const commonProps = {
      name,
      value: formData[name] || '',
      onChange: (e) => handleChange(name, e.target.value),
      onBlur: () => handleBlur(name),
      isInvalid: showError,
      disabled: loading || disabled,
      ...fieldProps
    };

    const renderInput = () => {
      switch (type) {
        case 'textarea':
          return (
            <Form.Control
              as="textarea"
              rows={3}
              placeholder={placeholder}
              {...commonProps}
            />
          );

        case 'select':
          return (
            <Form.Select placeholder={placeholder} {...commonProps}>
              <option value="">{placeholder || 'Seleccionar...'}</option>
              {options.map((option, index) => (
                <option key={index} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Form.Select>
          );

        case 'checkbox':
          return (
            <div className="checkbox-container">
              <Form.Check
                type="checkbox"
                checked={formData[name] || false}
                onChange={(e) => handleChange(name, e.target.checked)}
                onBlur={() => handleBlur(name)}
                disabled={loading || disabled}
                className="custom-checkbox"
                {...fieldProps}
              />
            </div>
          );

        case 'radio':
          return (
            <div>
              {options.map((option, index) => (
                <Form.Check
                  key={index}
                  type="radio"
                  name={name}
                  id={`${name}-${index}`}
                  label={option.label}
                  value={option.value}
                  checked={formData[name] === option.value}
                  onChange={(e) => handleChange(name, e.target.value)}
                  onBlur={() => handleBlur(name)}
                  disabled={loading || disabled}
                  {...fieldProps}
                />
              ))}
            </div>
          );

        case 'file':
          return (
            <Form.Control
              type="file"
              onChange={(e) => handleChange(name, e.target.files[0])}
              onBlur={() => handleBlur(name)}
              disabled={loading || disabled}
              {...fieldProps}
            />
          );

        default:
          return (
            <Form.Control
              type={type}
              placeholder={placeholder}
              {...commonProps}
            />
          );
      }
    };

    return (
      <Form.Group key={name} className="mb-3">
        {label && (
          <Form.Label className="fw-semibold">
            {label}
            {required && <span className="text-danger ms-1">*</span>}
          </Form.Label>
        )}
        
        {renderInput()}
        
        {showError && (
          <Form.Control.Feedback type="invalid">
            {fieldError}
          </Form.Control.Feedback>
        )}
        
        {helpText && !showError && (
          <Form.Text className="text-muted">
            {helpText}
          </Form.Text>
        )}
      </Form.Group>
    );
  };

  const renderFormContent = () => {
    // Forzar layout vertical siempre
    return fields.map((field, index) => (
      <motion.div
        key={index}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3, delay: index * 0.1 }}
      >
        {renderField(field)}
      </motion.div>
    ));
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <Card className="border-0 shadow-sm">
        <Card.Header className="bg-transparent border-0">
          <h5 className="fw-semibold mb-0">{title}</h5>
        </Card.Header>
        
        <Card.Body>
          <Form onSubmit={handleSubmit}>
            {renderFormContent()}
            
            <div className="d-flex justify-content-end gap-2 mt-4">
              {onCancel && (
                <Button
                  variant="outline-secondary"
                  onClick={onCancel}
                  disabled={loading}
                >
                  <X size={16} className="me-2" />
                  {cancelText}
                </Button>
              )}
              
              <Button
                type="submit"
                variant="primary"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <div className="spinner-border spinner-border-sm me-2" role="status">
                      <span className="visually-hidden">Guardando...</span>
                    </div>
                    Guardando...
                  </>
                ) : (
                  <>
                    <Save size={16} className="me-2" />
                    {submitText}
                  </>
                )}
              </Button>
            </div>
          </Form>
        </Card.Body>
      </Card>
    </motion.div>
  );
};

export default ModernForm; 