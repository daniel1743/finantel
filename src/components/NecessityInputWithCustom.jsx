// =====================================================
// COMPONENTE: NecessityInputWithCustom
// =====================================================
// Input de nivel de necesidad con soporte para personalización
// =====================================================

import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronDown, Trash2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const BASE_OPTIONS = [
  { id: 'necesario', name: 'Necesario', color: 'text-green-600', isCustom: false },
  { id: 'innecesario', name: 'Innecesario', color: 'text-red-600', isCustom: false },
  { id: 'personalizada', name: 'Personalizada', color: 'text-blue-600', isCustom: true }
];

export const NecessityInputWithCustom = ({
  value,
  onChange,
  customNeeds = [],
  placeholder = "Selecciona nivel de necesidad",
  disabled = false,
  required = false,
  onDeleteCustom = null
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [inputValue, setInputValue] = useState('');
  const [isTextMode, setIsTextMode] = useState(false);
  const dropdownRef = useRef(null);

  // Combinar opciones base con necesidades personalizadas
  const allOptions = [
    ...BASE_OPTIONS,
    ...customNeeds.map(need => ({
      id: need.id,
      name: need.name,
      isCustom: true
    }))
  ];

  const selectedOption = allOptions.find(opt => opt.id === value) || 
    (isTextMode && value ? { name: value, isCustom: true } : null);

  // Cerrar al hacer click fuera
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  // Si el usuario escribe, activar modo texto
  const handleInputChange = (e) => {
    const val = e.target.value;
    setInputValue(val);
    
    if (val.trim()) {
      setIsTextMode(true);
      onChange(val.trim()); // Pasar el texto directamente
    } else {
      setIsTextMode(false);
      onChange('');
    }
  };

  const handleSelectOption = (option) => {
    if (option.id === 'personalizada') {
      setIsTextMode(true);
      setInputValue('');
      onChange('');
    } else {
      setIsTextMode(false);
      setInputValue('');
      onChange(option.id);
    }
    setIsOpen(false);
  };

  const handleDeleteCustom = (e, needId) => {
    e.stopPropagation();
    if (onDeleteCustom) {
      onDeleteCustom(needId);
    }
  };

  return (
    <div ref={dropdownRef} className="relative">
      {isTextMode ? (
        <div className="relative">
          <input
            type="text"
            value={inputValue}
            onChange={handleInputChange}
            placeholder="Escribe tu necesidad personalizada..."
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0]",
              "transition-all disabled:opacity-50"
            )}
          />
          <button
            type="button"
            onClick={() => {
              setIsTextMode(false);
              setInputValue('');
              onChange('');
            }}
            className="absolute right-2 top-1/2 -translate-y-1/2 p-1 hover:bg-gray-100 dark:hover:bg-white/10 rounded"
          >
            <X className="w-4 h-4 text-gray-400" />
          </button>
        </div>
      ) : (
        <>
          <button
            type="button"
            onClick={() => !disabled && setIsOpen(!isOpen)}
            disabled={disabled}
            className={cn(
              "w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl",
              "focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0]",
              "transition-all disabled:opacity-50 text-left flex items-center justify-between",
              isOpen && "ring-2 ring-[#1C8FA0]/20 border-[#1C8FA0]"
            )}
          >
            <span className={cn(
              "truncate",
              !selectedOption && "text-gray-400 dark:text-gray-500"
            )}>
              {selectedOption ? selectedOption.name : placeholder}
            </span>
            <ChevronDown className={cn(
              "w-5 h-5 text-[#6E6E73] dark:text-gray-400 transition-transform flex-shrink-0 ml-2",
              isOpen && "transform rotate-180"
            )} />
          </button>

          <AnimatePresence>
            {isOpen && (
              <motion.div
                initial={{ opacity: 0, y: -10, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -10, scale: 0.95 }}
                transition={{ duration: 0.2 }}
                className="absolute z-[60] w-full mt-2 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-xl border border-gray-200 dark:border-white/10 overflow-hidden max-h-60 overflow-y-auto"
              >
                {allOptions.map((option) => {
                  const isSelected = value === option.id;
                  const isCustom = option.isCustom;
                  
                  return (
                    <div
                      key={option.id}
                      className={cn(
                        "w-full px-4 py-3 transition-colors flex items-center justify-between group",
                        "hover:bg-gray-50 dark:hover:bg-white/5",
                        isSelected && "bg-[#1C8FA0]/10 text-[#1C8FA0] dark:bg-[#1C8FA0]/20"
                      )}
                    >
                      <button
                        type="button"
                        onClick={() => handleSelectOption(option)}
                        className="flex-1 text-left"
                      >
                        {option.name}
                      </button>
                      {isCustom && onDeleteCustom && option.id !== 'personalizada' && (
                        <button
                          type="button"
                          onClick={(e) => handleDeleteCustom(e, option.id)}
                          className="p-1 opacity-0 group-hover:opacity-100 hover:bg-red-100 dark:hover:bg-red-900/20 rounded transition-opacity"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </button>
                      )}
                    </div>
                  );
                })}
              </motion.div>
            )}
          </AnimatePresence>
        </>
      )}
    </div>
  );
};

