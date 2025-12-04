import React from 'react';
import Icon from '@/components/ui/Icon';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

const QuickAccessCard = ({ title, description, icon: Icon, to, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, scale: 0.95 }}
    animate={{ opacity: 1, scale: 1 }}
    transition={{ duration: 0.4, delay }}
  >
    <Link
      to={to}
      className="block h-full bg-white dark:bg-[#1a1a1a] p-6 rounded-2xl border border-gray-100 dark:border-white/10 shadow-sm hover:shadow-lg hover:-translate-y-1 transition-all duration-300 group relative overflow-hidden"
    >
      <div
        className="absolute top-0 right-0 w-24 h-24 opacity-5 rounded-bl-full -mr-4 -mt-4 transition-all group-hover:scale-110 group-hover:opacity-10"
        style={{ backgroundColor: color }}
      />
      <div className="relative z-10">
        <div
          className="w-12 h-12 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300"
          style={{ backgroundColor: `${color}20` }}
        >
          <Icon className="w-6 h-6" style={{ color }} />
        </div>
        <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-2">{title}</h3>
        <p className="text-sm text-[#6E6E73] dark:text-gray-400 mb-4">{description}</p>
        <div className="flex items-center text-sm font-medium group-hover:gap-2 transition-all" style={{ color }}>
          Explorar <Icon component={ChevronRight} size="sm" color="default" className="ml-1" />
        </div>
      </div>
    </Link>
  </motion.div>
);

export default QuickAccessCard;
