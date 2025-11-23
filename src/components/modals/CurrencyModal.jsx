import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check, Globe } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';

const CURRENCIES = [
  // América del Norte
  { code: 'USD', name: 'Dólar Estadounidense', symbol: '$', region: 'América del Norte', flag: '🇺🇸' },
  { code: 'CAD', name: 'Dólar Canadiense', symbol: 'C$', region: 'América del Norte', flag: '🇨🇦' },
  { code: 'MXN', name: 'Peso Mexicano', symbol: '$', region: 'América del Norte', flag: '🇲🇽' },
  
  // América Latina
  { code: 'ARS', name: 'Peso Argentino', symbol: '$', region: 'América Latina', flag: '🇦🇷' },
  { code: 'BRL', name: 'Real Brasileño', symbol: 'R$', region: 'América Latina', flag: '🇧🇷' },
  { code: 'CLP', name: 'Peso Chileno', symbol: '$', region: 'América Latina', flag: '🇨🇱' },
  { code: 'COP', name: 'Peso Colombiano', symbol: '$', region: 'América Latina', flag: '🇨🇴' },
  { code: 'PEN', name: 'Sol Peruano', symbol: 'S/', region: 'América Latina', flag: '🇵🇪' },
  { code: 'UYU', name: 'Peso Uruguayo', symbol: '$', region: 'América Latina', flag: '🇺🇾' },
  { code: 'VES', name: 'Bolívar Venezolano', symbol: 'Bs.', region: 'América Latina', flag: '🇻🇪' },
  { code: 'GTQ', name: 'Quetzal Guatemalteco', symbol: 'Q', region: 'América Latina', flag: '🇬🇹' },
  { code: 'CRC', name: 'Colón Costarricense', symbol: '₡', region: 'América Latina', flag: '🇨🇷' },
  { code: 'PAB', name: 'Balboa Panameño', symbol: 'B/.', region: 'América Latina', flag: '🇵🇦' },
  { code: 'DOP', name: 'Peso Dominicano', symbol: '$', region: 'América Latina', flag: '🇩🇴' },
  
  // Europa
  { code: 'EUR', name: 'Euro', symbol: '€', region: 'Europa', flag: '🇪🇺' },
  { code: 'GBP', name: 'Libra Esterlina', symbol: '£', region: 'Europa', flag: '🇬🇧' },
  { code: 'CHF', name: 'Franco Suizo', symbol: 'CHF', region: 'Europa', flag: '🇨🇭' },
  { code: 'RUB', name: 'Rublo Ruso', symbol: '₽', region: 'Europa', flag: '🇷🇺' },
  { code: 'PLN', name: 'Złoty Polaco', symbol: 'zł', region: 'Europa', flag: '🇵🇱' },
  { code: 'SEK', name: 'Corona Sueca', symbol: 'kr', region: 'Europa', flag: '🇸🇪' },
  { code: 'NOK', name: 'Corona Noruega', symbol: 'kr', region: 'Europa', flag: '🇳🇴' },
  { code: 'DKK', name: 'Corona Danesa', symbol: 'kr', region: 'Europa', flag: '🇩🇰' },
  
  // Asia
  { code: 'JPY', name: 'Yen Japonés', symbol: '¥', region: 'Asia', flag: '🇯🇵' },
  { code: 'CNY', name: 'Yuan Chino', symbol: '¥', region: 'Asia', flag: '🇨🇳' },
  { code: 'INR', name: 'Rupia India', symbol: '₹', region: 'Asia', flag: '🇮🇳' },
  { code: 'KRW', name: 'Won Surcoreano', symbol: '₩', region: 'Asia', flag: '🇰🇷' },
  { code: 'SGD', name: 'Dólar de Singapur', symbol: 'S$', region: 'Asia', flag: '🇸🇬' },
  { code: 'HKD', name: 'Dólar de Hong Kong', symbol: 'HK$', region: 'Asia', flag: '🇭🇰' },
  { code: 'THB', name: 'Baht Tailandés', symbol: '฿', region: 'Asia', flag: '🇹🇭' },
  { code: 'IDR', name: 'Rupia Indonesia', symbol: 'Rp', region: 'Asia', flag: '🇮🇩' },
  { code: 'MYR', name: 'Ringgit Malayo', symbol: 'RM', region: 'Asia', flag: '🇲🇾' },
  { code: 'PHP', name: 'Peso Filipino', symbol: '₱', region: 'Asia', flag: '🇵🇭' },
  
  // África
  { code: 'ZAR', name: 'Rand Sudafricano', symbol: 'R', region: 'África', flag: '🇿🇦' },
  { code: 'EGP', name: 'Libra Egipcia', symbol: 'E£', region: 'África', flag: '🇪🇬' },
  { code: 'NGN', name: 'Naira Nigeriana', symbol: '₦', region: 'África', flag: '🇳🇬' },
  { code: 'KES', name: 'Chelín Keniano', symbol: 'KSh', region: 'África', flag: '🇰🇪' },
  { code: 'MAD', name: 'Dirham Marroquí', symbol: 'DH', region: 'África', flag: '🇲🇦' },
];

const CurrencyModal = ({ isOpen, onClose }) => {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [selectedCurrency, setSelectedCurrency] = useState('USD');
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    if (isOpen && user?.id) {
      loadCurrency();
    }
  }, [isOpen, user?.id]);

  const loadCurrency = async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profile_preferences')
        .select('currency')
        .eq('user_id', user.id)
        .maybeSingle(); // Usar maybeSingle en lugar de single

      if (error && error.code !== 'PGRST116') {
        throw error;
      }

      if (data?.currency) {
        setSelectedCurrency(data.currency);
      } else {
        // Si no hay preferencias, usar USD como default
        setSelectedCurrency('USD');
      }
    } catch (error) {
      console.error('Error loading currency:', error);
      // En caso de error, usar USD como default
      setSelectedCurrency('USD');
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    if (!user?.id) return;

    setSaving(true);
    try {
      const { error } = await supabase
        .from('profile_preferences')
        .upsert({
          user_id: user.id,
          currency: selectedCurrency,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "¡Guardado!",
        description: `Moneda actualizada a ${CURRENCIES.find(c => c.code === selectedCurrency)?.name}`,
      });

      onClose();
    } catch (error) {
      console.error('Error saving currency:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar la moneda",
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredCurrencies = CURRENCIES.filter(currency =>
    currency.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
    currency.region.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const groupedCurrencies = filteredCurrencies.reduce((acc, currency) => {
    if (!acc[currency.region]) {
      acc[currency.region] = [];
    }
    acc[currency.region].push(currency);
    return acc;
  }, {});

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/20 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-10 max-h-[90vh] overflow-hidden flex flex-col"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Moneda Principal</h2>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
              Selecciona la moneda para tus transacciones
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={saving}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
          </button>
        </div>

        <div className="mb-4">
          <div className="relative">
            <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
            <input
              type="text"
              placeholder="Buscar moneda..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto space-y-6 pr-2">
          {loading ? (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#1C8FA0]"></div>
            </div>
          ) : (
            Object.entries(groupedCurrencies).map(([region, currencies]) => (
              <div key={region}>
                <h3 className="text-sm font-bold text-[#6E6E73] dark:text-gray-400 uppercase tracking-wider mb-3">
                  {region}
                </h3>
                <div className="space-y-2">
                  {currencies.map((currency) => (
                    <button
                      key={currency.code}
                      onClick={() => setSelectedCurrency(currency.code)}
                      disabled={saving}
                      className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all ${
                        selectedCurrency === currency.code
                          ? 'bg-[#1C8FA0]/10 border-[#1C8FA0] text-[#1C8FA0]'
                          : 'bg-gray-50 dark:bg-white/5 border-gray-100 dark:border-white/10 hover:border-gray-200 dark:hover:border-white/20'
                      } disabled:opacity-50`}
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{currency.flag}</span>
                        <div className="text-left">
                          <p className="font-bold text-[#1a1a1a] dark:text-white text-sm">
                            {currency.name}
                          </p>
                          <p className="text-xs text-[#6E6E73] dark:text-gray-400">
                            {currency.code} • {currency.symbol}
                          </p>
                        </div>
                      </div>
                      {selectedCurrency === currency.code && (
                        <Check className="w-5 h-5 text-[#1C8FA0]" />
                      )}
                    </button>
                  ))}
                </div>
              </div>
            ))
          )}
        </div>

        <div className="flex gap-3 mt-6 pt-6 border-t border-gray-100 dark:border-white/10">
          <Button
            onClick={onClose}
            variant="outline"
            disabled={saving}
            className="flex-1"
          >
            Cancelar
          </Button>
          <Button
            onClick={handleSave}
            disabled={saving || loading}
            className="flex-1 bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100"
          >
            {saving ? 'Guardando...' : 'Guardar Cambios'}
          </Button>
        </div>
      </motion.div>
    </div>
  );
};

export default CurrencyModal;

