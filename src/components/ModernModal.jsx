import React from 'react';
import { Modal, Button } from 'react-bootstrap';
import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertCircle, CheckCircle, Info, AlertTriangle } from 'lucide-react';

const ModernModal = ({
  show,
  onHide,
  title,
  children,
  size = 'md',
  centered = true,
  backdrop = 'static',
  keyboard = true,
  showCloseButton = true,
  closeButtonText = 'Cerrar',
  primaryButton,
  secondaryButton,
  type = 'default', // default, success, warning, error, info
  loading = false,
  className = ''
}) => {
  const getIcon = () => {
    switch (type) {
      case 'success':
        return <CheckCircle size={24} className="text-success" />;
      case 'warning':
        return <AlertTriangle size={24} className="text-warning" />;
      case 'error':
        return <AlertCircle size={24} className="text-danger" />;
      case 'info':
        return <Info size={24} className="text-info" />;
      default:
        return null;
    }
  };

  const getTypeClass = () => {
    switch (type) {
      case 'success':
        return 'border-success';
      case 'warning':
        return 'border-warning';
      case 'error':
        return 'border-danger';
      case 'info':
        return 'border-info';
      default:
        return '';
    }
  };

  return (
    <AnimatePresence>
      {show && (
        <Modal
          show={show}
          onHide={onHide}
          size={size}
          centered={centered}
          backdrop={backdrop}
          keyboard={keyboard}
          className={className}
        >
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.8 }}
            transition={{ duration: 0.2 }}
          >
            <Modal.Header className={`border-0 pb-0 ${getTypeClass()}`}>
              <div className="d-flex align-items-center w-100">
                {getIcon() && (
                  <div className="me-3">
                    {getIcon()}
                  </div>
                )}
                <Modal.Title className="fw-semibold flex-grow-1">
                  {title}
                </Modal.Title>
                {showCloseButton && (
                  <Button
                    variant="link"
                    onClick={onHide}
                    className="p-0 text-muted"
                    disabled={loading}
                  >
                    <X size={20} />
                  </Button>
                )}
              </div>
            </Modal.Header>

            <Modal.Body className="pt-3">
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1, duration: 0.2 }}
              >
                {children}
              </motion.div>
            </Modal.Body>

            {(primaryButton || secondaryButton || showCloseButton) && (
              <Modal.Footer className="border-0 pt-0">
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.2, duration: 0.2 }}
                  className="d-flex gap-2 w-100"
                >
                  {secondaryButton && (
                    <Button
                      variant={secondaryButton.variant || 'outline-secondary'}
                      onClick={secondaryButton.onClick}
                      disabled={loading || secondaryButton.disabled}
                      className="flex-grow-1"
                    >
                      {secondaryButton.icon && (
                        <span className="me-2">{secondaryButton.icon}</span>
                      )}
                      {secondaryButton.text}
                    </Button>
                  )}

                  {primaryButton && (
                    <Button
                      variant={primaryButton.variant || 'primary'}
                      onClick={primaryButton.onClick}
                      disabled={loading || primaryButton.disabled}
                      className="flex-grow-1"
                    >
                      {loading ? (
                        <>
                          <div className="spinner-border spinner-border-sm me-2" role="status">
                            <span className="visually-hidden">Cargando...</span>
                          </div>
                          {primaryButton.loadingText || 'Procesando...'}
                        </>
                      ) : (
                        <>
                          {primaryButton.icon && (
                            <span className="me-2">{primaryButton.icon}</span>
                          )}
                          {primaryButton.text}
                        </>
                      )}
                    </Button>
                  )}

                  {showCloseButton && !primaryButton && !secondaryButton && (
                    <Button
                      variant="primary"
                      onClick={onHide}
                      disabled={loading}
                      className="flex-grow-1"
                    >
                      {closeButtonText}
                    </Button>
                  )}
                </motion.div>
              </Modal.Footer>
            )}
          </motion.div>
        </Modal>
      )}
    </AnimatePresence>
  );
};

// Convenience components for common modal types
export const ConfirmModal = ({
  show,
  onHide,
  onConfirm,
  title = 'Confirmar acción',
  message = '¿Estás seguro de que quieres realizar esta acción?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  type = 'warning',
  loading = false
}) => (
  <ModernModal
    show={show}
    onHide={onHide}
    title={title}
    type={type}
    loading={loading}
    primaryButton={{
      text: confirmText,
      onClick: onConfirm,
      variant: type === 'error' ? 'danger' : 'primary'
    }}
    secondaryButton={{
      text: cancelText,
      onClick: onHide,
      variant: 'outline-secondary'
    }}
  >
    <p className="mb-0">{message}</p>
  </ModernModal>
);

export const AlertModal = ({
  show,
  onHide,
  title,
  message,
  type = 'info',
  buttonText = 'Entendido'
}) => (
  <ModernModal
    show={show}
    onHide={onHide}
    title={title}
    type={type}
    primaryButton={{
      text: buttonText,
      onClick: onHide,
      variant: type === 'error' ? 'danger' : 'primary'
    }}
  >
    <p className="mb-0">{message}</p>
  </ModernModal>
);

export default ModernModal; 