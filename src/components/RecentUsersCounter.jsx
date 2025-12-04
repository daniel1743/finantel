import React, { useState, useEffect } from 'react';
import Icon from '@/components/ui/Icon';
import { motion } from 'framer-motion';
import { Users, Clock } from 'lucide-react';

// Simulación de usuarios recientes (en producción, esto vendría de una API)
const generateRecentUsers = () => {
  const names = [
    'María', 'Carlos', 'Ana', 'Roberto', 'Laura', 'Diego', 'Sofía', 'Andrés',
    'Valentina', 'Sebastián', 'Camila', 'Nicolás', 'Isabella', 'Matías', 'Javiera'
  ];
  const cities = [
    'Santiago', 'Valparaíso', 'Concepción', 'La Serena', 'Antofagasta',
    'Temuco', 'Rancagua', 'Talca', 'Iquique', 'Arica'
  ];

  const randomName = names[Math.floor(Math.random() * names.length)];
  const randomCity = cities[Math.floor(Math.random() * cities.length)];
  const minutesAgo = Math.floor(Math.random() * 30) + 1;

  return {
    name: randomName,
    city: randomCity,
    minutesAgo
  };
};

const RecentUsersCounter = () => {
  const [recentUsers, setRecentUsers] = useState([]);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setIsVisible(true);
          }
        });
      },
      { threshold: 0.1 }
    );

    const element = document.getElementById('recent-users');
    if (element) {
      observer.observe(element);
    }

    return () => {
      if (element) {
        observer.unobserve(element);
      }
    };
  }, []);

  useEffect(() => {
    if (!isVisible) return;

    // Generar usuario inicial
    setRecentUsers([generateRecentUsers()]);

    // Agregar nuevos usuarios cada 8-15 segundos
    const interval = setInterval(() => {
      setRecentUsers((prev) => {
        const newUser = generateRecentUsers();
        const updated = [newUser, ...prev].slice(0, 3); // Mantener solo los 3 más recientes
        return updated;
      });
    }, Math.random() * 7000 + 8000); // Entre 8 y 15 segundos

    return () => clearInterval(interval);
  }, [isVisible]);

  if (!isVisible || recentUsers.length === 0) {
    return null;
  }

  return (
    <motion.div
      id="recent-users"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="fixed top-20 right-4 z-40 hidden lg:block"
    >
      <div className="bg-white/95 dark:bg-[#1a1a1a]/95 backdrop-blur-xl rounded-2xl shadow-xl border border-gray-200 dark:border-white/10 p-4 min-w-[280px]">
        <div className="flex items-center gap-2 mb-3">
          <div className="w-8 h-8 rounded-full bg-[#1C8FA0]/10 flex items-center justify-center">
            <Icon component={Users} size="sm" color="primary" />
          </div>
          <div>
            <p className="text-xs font-semibold text-[#1a1a1a] dark:text-white">
              Usuarios recientes
            </p>
            <p className="text-xs text-[#6E6E73] dark:text-gray-400">
              Únete ahora
            </p>
          </div>
        </div>

        <div className="space-y-2">
          {recentUsers.map((user, index) => (
            <motion.div
              key={`${user.name}-${user.minutesAgo}-${index}`}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.3 }}
              className="flex items-center gap-2 text-xs"
            >
              <div className="w-6 h-6 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#E47B45] flex items-center justify-center text-white font-bold text-[10px]">
                {user.name.charAt(0)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[#1a1a1a] dark:text-white font-medium truncate">
                  {user.name}
                </p>
                <p className="text-[#6E6E73] dark:text-gray-400 truncate">
                  {user.city}
                </p>
              </div>
              <div className="flex items-center gap-1 text-[#6E6E73] dark:text-gray-400">
                <Icon component={Clock} size="xs" color="default" />
                <span>{user.minutesAgo}m</span>
              </div>
            </motion.div>
          ))}
        </div>

        <div className="mt-3 pt-3 border-t border-gray-200 dark:border-white/10">
          <p className="text-xs text-[#6E6E73] dark:text-gray-400 text-center">
            <span className="font-semibold text-[#1C8FA0]">10,000+</span> usuarios activos
          </p>
        </div>
      </div>
    </motion.div>
  );
};

export default RecentUsersCounter;
