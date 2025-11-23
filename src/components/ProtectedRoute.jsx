
import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { Loader2 } from 'lucide-react';

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-[#F5F7F9]">
        <div className="flex flex-col items-center gap-4">
          <div className="w-12 h-12 bg-[#1C8FA0] rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-lg shadow-[#1C8FA0]/20 animate-pulse">
            F
          </div>
          <Loader2 className="w-6 h-6 text-[#1C8FA0] animate-spin" />
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" state={{ from: location }} replace />;
  }

  return children;
};

export default ProtectedRoute;
