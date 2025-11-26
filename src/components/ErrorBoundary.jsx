import React from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNavigate } from 'react-router-dom';

class ErrorBoundaryClass extends React.Component {
  constructor(props) {
    super(props);
    this.state = { 
      hasError: false, 
      error: null,
      errorInfo: null 
    };
  }

  static getDerivedStateFromError(error) {
    // Actualizar el estado para que la próxima renderización muestre la UI de error
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    // Registrar el error en un servicio de logging
    console.error('Error capturado por ErrorBoundary:', error, errorInfo);
    this.setState({
      error,
      errorInfo
    });

    // Aquí podrías enviar el error a un servicio de logging como Sentry
    // logErrorToService(error, errorInfo);
  }

  handleReset = () => {
    this.setState({ 
      hasError: false, 
      error: null,
      errorInfo: null 
    });
  };

  render() {
    if (this.state.hasError) {
      // Puedes renderizar cualquier UI de error personalizada
      return (
        <ErrorFallback 
          error={this.state.error}
          errorInfo={this.state.errorInfo}
          onReset={this.handleReset}
        />
      );
    }

    return this.props.children;
  }
}

const ErrorFallback = ({ error, errorInfo, onReset }) => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen flex items-center justify-center bg-[#F5F7F9] dark:bg-[#0f0f11] p-4">
      <div className="max-w-2xl w-full bg-white dark:bg-[#1a1a1a] rounded-[32px] shadow-xl border border-gray-200 dark:border-white/10 p-8 md:p-12">
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-red-100 dark:bg-red-900/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <AlertTriangle className="w-8 h-8 text-red-600 dark:text-red-400" />
          </div>
          
          <h1 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-3">
            Algo salió mal
          </h1>
          
          <p className="text-[#6E6E73] dark:text-gray-400 mb-6">
            Lo sentimos, ocurrió un error inesperado. Por favor, intenta recargar la página o volver al inicio.
          </p>
        </div>

        {/* Error Details (solo en desarrollo) */}
        {import.meta.env.DEV && error && (
          <div className="mb-6 p-4 bg-gray-50 dark:bg-white/5 rounded-xl border border-gray-200 dark:border-white/10">
            <p className="text-sm font-semibold text-[#1a1a1a] dark:text-white mb-2">
              Detalles del error (solo visible en desarrollo):
            </p>
            <pre className="text-xs text-red-600 dark:text-red-400 overflow-auto max-h-48">
              {error.toString()}
              {errorInfo?.componentStack && (
                <div className="mt-2 text-gray-600 dark:text-gray-400">
                  {errorInfo.componentStack}
                </div>
              )}
            </pre>
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button
            onClick={onReset}
            className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white rounded-full px-6 py-3 font-medium shadow-lg shadow-[#1C8FA0]/20 transition-all hover:-translate-y-0.5"
          >
            <RefreshCw className="w-4 h-4 mr-2" />
            Intentar de nuevo
          </Button>
          
          <Button
            onClick={() => {
              navigate('/');
              onReset();
            }}
            variant="outline"
            className="border-[#1C8FA0] text-[#1C8FA0] hover:bg-[#1C8FA0]/10 rounded-full px-6 py-3 font-medium"
          >
            <Home className="w-4 h-4 mr-2" />
            Volver al inicio
          </Button>
        </div>

        {/* Help Text */}
        <div className="mt-8 pt-6 border-t border-gray-200 dark:border-white/10 text-center">
          <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-2">
            Si el problema persiste, por favor contacta a soporte.
          </p>
          <a
            href="/dashboard/support"
            className="text-sm text-[#1C8FA0] hover:underline font-medium"
          >
            Contactar Soporte
          </a>
        </div>
      </div>
    </div>
  );
};

// Wrapper funcional para usar hooks
const ErrorBoundary = ({ children }) => {
  return <ErrorBoundaryClass>{children}</ErrorBoundaryClass>;
};

export default ErrorBoundary;

