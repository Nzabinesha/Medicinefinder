import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function Checkout() {
  const navigate = useNavigate();

  useEffect(() => {
    navigate('/prescription', { replace: true });
  }, [navigate]);

  return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="text-center">
        <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary-600"></div>
        <p className="mt-4 text-gray-600">Redirecting to checkout...</p>
      </div>
    </div>
  );
}

