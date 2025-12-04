import React from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Lock, Users, ArrowRight, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

const UpgradeRequired = ({ featureName = "esta funcionalidad", planName = "Plan Familiar" }) => {
  return (
    <div className="flex items-center justify-center min-h-[60vh] p-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-2xl w-full bg-white dark:bg-[#1a1a1a] rounded-[26px] p-12 border border-gray-100 dark:border-white/10 shadow-xl text-center"
      >
        <div className="flex justify-center mb-6">
          <div className="w-24 h-24 bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] rounded-full flex items-center justify-center shadow-lg shadow-[#1C8FA0]/20">
            <Icon component={Lock} size="md" color="white" />
          </div>
        </div>
        
        <h2 className="text-3xl font-bold text-[#1a1a1a] dark:text-white mb-4">
          Funcionalidad Premium
        </h2>
        
        <p className="text-lg text-[#6E6E73] dark:text-gray-400 mb-8">
          {featureName} está disponible exclusivamente para usuarios con {planName}.
        </p>

        <div className="bg-gradient-to-r from-[#1C8FA0]/10 to-[#E47B45]/10 dark:from-[#1C8FA0]/20 dark:to-[#E47B45]/20 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Icon component={Users} size="lg" color="primary" />
            <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
              Beneficios del Plan Familiar
            </h3>
          </div>
          <ul className="space-y-3 text-left max-w-md mx-auto">
            <li className="flex items-start gap-3">
              <Icon component={Sparkles} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
              <span className="text-[#6E6E73] dark:text-gray-400">
                Hasta 5 miembros de familia
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Icon component={Sparkles} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
              <span className="text-[#6E6E73] dark:text-gray-400">
                Gastos compartidos y división automática
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Icon component={Sparkles} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
              <span className="text-[#6E6E73] dark:text-gray-400">
                Dashboard familiar con métricas compartidas
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Icon component={Sparkles} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
              <span className="text-[#6E6E73] dark:text-gray-400">
                Gestión de deudas entre miembros
              </span>
            </li>
            <li className="flex items-start gap-3">
              <Icon component={Sparkles} size="md" color="primary" className="mt-0.5 flex-shrink-0" />
              <span className="text-[#6E6E73] dark:text-gray-400">
                Roles y permisos personalizables
              </span>
            </li>
          </ul>
        </div>

        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Link to="/dashboard/billing">
            <Button className="bg-[#1C8FA0] hover:bg-[#167a8a] text-white px-8 py-6 text-lg rounded-xl shadow-lg shadow-[#1C8FA0]/20">
              Actualizar a Plan Familiar
              <Icon component={ArrowRight} size="md" color="default" className="ml-2" />
            </Button>
          </Link>
          <Link to="/pricing">
            <Button variant="outline" className="px-8 py-6 text-lg rounded-xl border-2 border-gray-200 dark:border-white/10 hover:border-[#1C8FA0]">
              Ver Planes y Precios
            </Button>
          </Link>
        </div>
      </motion.div>
    </div>
  );
};

export default UpgradeRequired;

