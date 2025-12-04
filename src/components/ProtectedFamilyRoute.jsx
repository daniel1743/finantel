import React from 'react';
import Icon from '@/components/ui/Icon';
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
        <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
      </div>
    );
  }

  // Verificar si tiene plan familiar
  // Si no hay subscription o la tabla no existe, se considera que no tiene plan familiar
  const hasFamilyPlan = subscription && (
    subscription.plan === 'familiar' || 
    subscription.plan === 'family' || 
    subscription.plan === 'Familiar'
  );

  if (!hasFamilyPlan) {
    return <UpgradeRequired featureName={featureName} planName="Plan Familiar" />;
  }

  return <>{children}</>;
};

export default ProtectedFamilyRoute;

