import React from 'react';
import { useBilling } from '@/hooks/useBilling';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import UpgradeRequired from './UpgradeRequired';
import { Loader2 } from 'lucide-react';

const ProtectedFamilyRoute = ({ children, featureName }) => {
  const { user } = useAuth();
  const { subscription, loading } = useBilling(user?.id);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh]">
        <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
      </div>
    );
  }

  // Verificar si tiene plan familiar
  const hasFamilyPlan = subscription?.plan === 'familiar' || subscription?.plan === 'family' || subscription?.plan === 'Familiar';

  if (!hasFamilyPlan) {
    return <UpgradeRequired featureName={featureName} planName="Plan Familiar" />;
  }

  return <>{children}</>;
};

export default ProtectedFamilyRoute;

