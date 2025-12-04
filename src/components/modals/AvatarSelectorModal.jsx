import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Check } from 'lucide-react';

// Avatares premium usando diferentes estilos de DiceBear y otros servicios premium
// Estos son avatares de alta calidad con diferentes estilos
const PREMIUM_AVATARS = [
  // Estilo Avataaars (premium)
  { id: 1, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium1&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Avataar 1' },
  { id: 2, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium2&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Avataar 2' },
  { id: 3, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium3&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Avataar 3' },
  { id: 4, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium4&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Avataar 4' },
  { id: 5, url: 'https://api.dicebear.com/7.x/avataaars/svg?seed=premium5&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Avataar 5' },
  
  // Estilo Pixel Art (premium)
  { id: 6, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel1&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Pixel 1' },
  { id: 7, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel2&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Pixel 2' },
  { id: 8, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel3&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Pixel 3' },
  { id: 9, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel4&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Pixel 4' },
  { id: 10, url: 'https://api.dicebear.com/7.x/pixel-art/svg?seed=pixel5&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Pixel 5' },
  
  // Estilo Personas (premium)
  { id: 11, url: 'https://api.dicebear.com/7.x/personas/svg?seed=persona1&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Persona 1' },
  { id: 12, url: 'https://api.dicebear.com/7.x/personas/svg?seed=persona2&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Persona 2' },
  { id: 13, url: 'https://api.dicebear.com/7.x/personas/svg?seed=persona3&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Persona 3' },
  { id: 14, url: 'https://api.dicebear.com/7.x/personas/svg?seed=persona4&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Persona 4' },
  { id: 15, url: 'https://api.dicebear.com/7.x/personas/svg?seed=persona5&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Persona 5' },
  
  // Estilo Bottts (premium)
  { id: 16, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot1&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Bot 1' },
  { id: 17, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot2&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Bot 2' },
  { id: 18, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot3&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Bot 3' },
  { id: 19, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot4&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Bot 4' },
  { id: 20, url: 'https://api.dicebear.com/7.x/bottts/svg?seed=bot5&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Bot 5' },
  
  // Estilo Micah (premium)
  { id: 21, url: 'https://api.dicebear.com/7.x/micah/svg?seed=micah1&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Micah 1' },
  { id: 22, url: 'https://api.dicebear.com/7.x/micah/svg?seed=micah2&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Micah 2' },
  { id: 23, url: 'https://api.dicebear.com/7.x/micah/svg?seed=micah3&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Micah 3' },
  { id: 24, url: 'https://api.dicebear.com/7.x/micah/svg?seed=micah4&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Micah 4' },
  { id: 25, url: 'https://api.dicebear.com/7.x/micah/svg?seed=micah5&backgroundColor=b6e3f4,c0aede,d1d4f9,ffd5dc,ffdfbf', name: 'Micah 5' },
];

const AvatarSelectorModal = ({ isOpen, onClose, onSelect, currentAvatar }) => {
  const [selectedAvatar, setSelectedAvatar] = useState(currentAvatar);

  const handleSelect = (avatar) => {
    setSelectedAvatar(avatar.url);
    onSelect(avatar.url);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
      />
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        onClick={(e) => e.stopPropagation()}
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-6 w-full max-w-4xl shadow-2xl border border-gray-100 dark:border-white/10 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Seleccionar Avatar Premium</h2>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
              Elige tu avatar favorito de nuestra colección premium
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors"
          >
            <Icon component={X} size="md" color="default" className="dark:" />
          </button>
        </div>

        <div className="grid grid-cols-5 gap-4">
          {PREMIUM_AVATARS.map((avatar) => {
            const isSelected = selectedAvatar === avatar.url;
            return (
              <motion.button
                key={avatar.id}
                onClick={() => handleSelect(avatar)}
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className={`relative group rounded-xl overflow-hidden border-2 transition-all ${
                  isSelected
                    ? 'border-[#1C8FA0] ring-2 ring-offset-2 ring-[#1C8FA0]/50 shadow-lg'
                    : 'border-gray-200 dark:border-white/10 hover:border-[#1C8FA0]/50'
                }`}
              >
                <div className="aspect-square bg-gray-50 dark:bg-white/5 p-2">
                  <img
                    src={avatar.url}
                    alt={avatar.name}
                    className="w-full h-full object-contain"
                  />
                </div>
                {isSelected && (
                  <motion.div
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    className="absolute top-2 right-2 w-6 h-6 bg-[#1C8FA0] rounded-full flex items-center justify-center shadow-lg"
                  >
                    <Icon component={Check} size="sm" color="white" />
                  </motion.div>
                )}
                <div className="absolute inset-0 bg-[#1C8FA0]/0 group-hover:bg-[#1C8FA0]/10 transition-colors rounded-xl" />
              </motion.button>
            );
          })}
        </div>
      </motion.div>
    </div>
  );
};

export default AvatarSelectorModal;

