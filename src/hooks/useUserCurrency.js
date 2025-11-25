import { useState, useEffect } from 'react';
import { supabase } from '@/lib/customSupabaseClient';
import { useAuth } from '@/contexts/SupabaseAuthContext';

// Mapeo de moneda a código de país ISO
// Para EUR usamos 'DE' (Alemania) como representante
const CURRENCY_TO_COUNTRY = {
  'USD': 'US',
  'EUR': 'DE', // Alemania como representante del Euro
  'GBP': 'GB',
  'MXN': 'MX',
  'ARS': 'AR',
  'CLP': 'CL',
  'COP': 'CO',
  'PEN': 'PE',
  'CAD': 'CA',
  'BRL': 'BR',
  'UYU': 'UY',
  'VES': 'VE',
  'GTQ': 'GT',
  'CRC': 'CR',
  'PAB': 'PA',
  'DOP': 'DO',
  'CHF': 'CH',
  'RUB': 'RU',
  'PLN': 'PL',
  'SEK': 'SE',
  'NOK': 'NO',
  'DKK': 'DK',
  'JPY': 'JP',
  'CNY': 'CN',
  'INR': 'IN',
  'KRW': 'KR',
  'SGD': 'SG',
  'HKD': 'HK',
  'THB': 'TH',
  'IDR': 'ID',
  'MYR': 'MY',
  'PHP': 'PH',
  'ZAR': 'ZA',
  'EGP': 'EG',
  'NGN': 'NG',
  'KES': 'KE',
  'MAD': 'MA',
};

export const useUserCurrency = () => {
  const { user } = useAuth();
  const [currency, setCurrency] = useState('USD');
  const [countryCode, setCountryCode] = useState('US');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.id) {
      loadCurrency();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadCurrency = async () => {
    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('currency')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      const userCurrency = data?.currency || 'USD';
      setCurrency(userCurrency);
      setCountryCode(CURRENCY_TO_COUNTRY[userCurrency] || 'US');
    } catch (error) {
      console.error('Error loading currency:', error);
      setCurrency('USD');
      setCountryCode('US');
    } finally {
      setLoading(false);
    }
  };

  return { currency, countryCode, loading, refetch: loadCurrency };
};

