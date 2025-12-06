import React, { useState } from 'react';
import Icon from '@/components/ui/Icon';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Plus, 
  GripVertical, 
  MoreVertical, 
  ShoppingBag, 
  Home, 
  Car, 
  Coffee, 
  Plane, 
  Zap, 
  Heart, 
  Smartphone,
  X,
  Check,
  Loader2,
  Edit,
  Trash2,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useFinance } from '@/hooks/useFinance';
import { useToast } from '@/components/ui/use-toast';

// Iconos y colores disponibles (compartidos)
const availableIcons = [Home, ShoppingBag, Car, Coffee, Plane, Zap, Heart, Smartphone];
const iconNames = ['Home', 'ShoppingBag', 'Car', 'Coffee', 'Plane', 'Zap', 'Heart', 'Smartphone'];

const availableColors = [
  { bg: 'bg-[#1C8FA0]', hex: '#1C8FA0' },
  { bg: 'bg-[#E47B45]', hex: '#E47B45' },
  { bg: 'bg-[#1a1a1a]', hex: '#1a1a1a' },
  { bg: 'bg-purple-500', hex: '#a855f7' },
  { bg: 'bg-green-500', hex: '#22c55e' },
  { bg: 'bg-blue-500', hex: '#3b82f6' },
  { bg: 'bg-red-500', hex: '#ef4444' },
  { bg: 'bg-yellow-500', hex: '#eab308' },
];

const categoriesData = [
  { id: 1, name: "Hogar", type: "Gasto", amount: 980.00, color: "bg-[#1C8FA0]", icon: Home },
  { id: 2, name: "Alimentación", type: "Gasto", amount: 450.00, color: "bg-[#E47B45]", icon: ShoppingBag },
  { id: 3, name: "Transporte", type: "Gasto", amount: 320.00, color: "bg-[#1a1a1a]", icon: Car },
  { id: 4, name: "Ocio", type: "Gasto", amount: 210.00, color: "bg-purple-500", icon: Coffee },
  { id: 5, name: "Viajes", type: "Gasto", amount: 0.00, color: "bg-sky-500", icon: Plane },
  { id: 6, name: "Servicios", type: "Gasto", amount: 145.00, color: "bg-yellow-500", icon: Zap },
  { id: 7, name: "Salud", type: "Gasto", amount: 80.00, color: "bg-red-500", icon: Heart },
  { id: 8, name: "Tecnología", type: "Gasto", amount: 59.99, color: "bg-blue-500", icon: Smartphone },
];

// Modal de Confirmación de Eliminación
const DeleteConfirmModal = ({ isOpen, onClose, onConfirm, categoryName, isLoading }) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
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
          className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10"
        >
          {/* Icono de advertencia */}
          <div className="flex justify-center mb-6">
            <div className="w-16 h-16 rounded-full bg-red-50 dark:bg-red-900/20 flex items-center justify-center border-2 border-red-200 dark:border-red-800">
              <Icon component={AlertTriangle} size="xl" className="text-red-500 dark:text-red-400" />
            </div>
          </div>

          {/* Título y mensaje */}
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-[#1a1a1a] dark:text-white mb-2">
              ¿Eliminar categoría?
            </h3>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 leading-relaxed">
              Estás a punto de eliminar la categoría <span className="font-semibold text-[#1a1a1a] dark:text-white">"{categoryName}"</span>. Esta acción no se puede deshacer.
            </p>
          </div>

          {/* Botones */}
          <div className="flex flex-col gap-3">
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className="w-full py-3 rounded-xl bg-red-500 hover:bg-red-600 text-white font-medium transition-colors shadow-lg shadow-red-500/20 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                  Eliminando...
                </>
              ) : (
                <>
                  <Icon component={Trash2} size="sm" color="default" />
                  Eliminar Categoría
                </>
              )}
            </button>
            <button
              onClick={onClose}
              disabled={isLoading}
              className="w-full py-3 rounded-xl border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 font-medium transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

const CategoryCard = ({ category, delay, onEdit, onDelete }) => {
  const [showMenu, setShowMenu] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);
  const menuRef = React.useRef(null);
  
  // Determinar si usar style (hex) o className (clase de Tailwind)
  const iconBgStyle = category.colorHex 
    ? { backgroundColor: category.colorHex }
    : undefined;
  
  const iconBgClass = category.colorClass 
    ? category.colorClass
    : category.colorHex 
      ? undefined 
      : 'bg-[#1C8FA0]'; // Fallback

  // Cerrar menú al hacer clic fuera
  React.useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setShowMenu(false);
      }
    };

    if (showMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showMenu]);

  const handleDelete = async () => {
    setIsDeleting(true);
    try {
      await onDelete(category.id);
      setShowDeleteModal(false);
    } catch (error) {
      console.error('Error deleting category:', error);
    } finally {
      setIsDeleting(false);
      setShowMenu(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className="group relative bg-white dark:bg-[#1a1a1a] rounded-[22px] p-6 border border-gray-100 dark:border-white/5 shadow-[0_10px_30px_-10px_rgba(0,0,0,0.05)] hover:shadow-[0_20px_40px_-12px_rgba(0,0,0,0.12)] hover:-translate-y-1 transition-all duration-300"
    >
      <div className="flex justify-between items-start mb-4">
        <div 
          className={cn(
            "w-12 h-12 rounded-full flex items-center justify-center text-white shadow-lg transition-transform group-hover:scale-110",
            iconBgClass
          )}
          style={iconBgStyle}
        >
          {React.isValidElement(category.icon) 
            ? category.icon 
            : React.createElement(category.icon, { className: "w-5 h-5" })}
        </div>
        <div className="relative" ref={menuRef}>
          <button 
            onClick={(e) => {
              e.stopPropagation();
              setShowMenu(!showMenu);
            }}
            className="p-2 text-gray-300 dark:text-gray-600 hover:text-[#1a1a1a] dark:hover:text-white transition-colors opacity-0 group-hover:opacity-100"
          >
            <Icon component={MoreVertical} size="md" color="default" />
          </button>
          
          {/* Menú Dropdown */}
          <AnimatePresence>
            {showMenu && (
              <motion.div
                initial={{ opacity: 0, scale: 0.95, y: -10 }}
                animate={{ opacity: 1, scale: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.95, y: -10 }}
                className="absolute right-0 top-full mt-2 w-40 bg-white dark:bg-[#1a1a1a] rounded-xl shadow-lg border border-gray-100 dark:border-white/10 z-50 overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    onEdit(category);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-[#1a1a1a] dark:text-white hover:bg-gray-50 dark:hover:bg-white/5 flex items-center gap-2 transition-colors"
                >
                  <Icon component={Edit} size="sm" color="default" />
                  Editar
                </button>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setShowMenu(false);
                    setShowDeleteModal(true);
                  }}
                  className="w-full px-4 py-3 text-left text-sm text-red-500 hover:bg-red-50 dark:hover:bg-red-500/10 flex items-center gap-2 transition-colors"
                >
                  <Icon component={Trash2} size="sm" color="default" />
                  Eliminar
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    
      <h3 className="text-lg font-bold text-[#1a1a1a] dark:text-white mb-1">{category.name}</h3>
      <div className="flex items-center gap-2 mb-4">
        <span className="text-xs font-medium text-[#6E6E73] dark:text-gray-400 bg-gray-100 dark:bg-white/5 px-2 py-0.5 rounded-full">
          {category.type}
        </span>
      </div>
      
      <div className="pt-4 border-t border-gray-50 dark:border-white/5">
        <p className="text-xs text-[#6E6E73] dark:text-gray-400 mb-1">Gasto mensual</p>
        <p className="text-xl font-bold text-[#1a1a1a] dark:text-white font-mono">${category.amount.toFixed(2)}</p>
      </div>

      {/* Glow Effect on Hover */}
      <div 
        className={cn(
          "absolute inset-0 rounded-[22px] opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none",
          !iconBgStyle && iconBgClass
        )}
        style={iconBgStyle ? { backgroundColor: category.colorHex } : undefined}
      />

      {/* Modal de Confirmación de Eliminación */}
      <DeleteConfirmModal
        isOpen={showDeleteModal}
        onClose={() => {
          setShowDeleteModal(false);
          setShowMenu(false);
        }}
        onConfirm={handleDelete}
        categoryName={category.name}
        isLoading={isDeleting}
      />
    </motion.div>
  );
};

const AddCategoryModal = ({ isOpen, onClose, onSuccess, editingCategory, onUpdate }) => {
  const { user } = useAuth();
  const { addCategory } = useFinance(user?.id);
  const { toast } = useToast();
  
  const isEditing = !!editingCategory;
  
  // Inicializar formData basado en si está editando o creando
  const getInitialFormData = () => {
    if (editingCategory) {
      const colorIndex = availableColors.findIndex(c => 
        c.hex === editingCategory.color || c.bg === editingCategory.color
      );
      const iconIndex = iconNames.indexOf(editingCategory.icon || 'Home');
      return {
        name: editingCategory.name || '',
        type: editingCategory.type === 'Gasto' ? 'expense' : (editingCategory.type === 'Ingreso' ? 'income' : 'expense'),
        color: editingCategory.colorHex || editingCategory.color || '#1C8FA0',
        icon: editingCategory.icon?.name || editingCategory.icon || 'Home'
      };
    }
    return {
      name: '',
      type: 'expense',
      color: '#1C8FA0',
      icon: 'Home'
    };
  };

  const [formData, setFormData] = useState(getInitialFormData());
  const [selectedColorIndex, setSelectedColorIndex] = useState(() => {
    if (editingCategory) {
      return availableColors.findIndex(c => 
        c.hex === editingCategory.color || c.bg === editingCategory.color
      ) || 0;
    }
    return 0;
  });
  const [selectedIconIndex, setSelectedIconIndex] = useState(() => {
    if (editingCategory) {
      return iconNames.indexOf(editingCategory.icon || 'Home') || 0;
    }
    return 0;
  });
  const [isLoading, setIsLoading] = useState(false);

  // Resetear form cuando cambia editingCategory
  React.useEffect(() => {
    if (isOpen) {
      const initialData = getInitialFormData();
      setFormData(initialData);
      const colorIdx = availableColors.findIndex(c => 
        c.hex === initialData.color || c.bg === initialData.color
      );
      const iconIdx = iconNames.indexOf(initialData.icon);
      setSelectedColorIndex(colorIdx >= 0 ? colorIdx : 0);
      setSelectedIconIndex(iconIdx >= 0 ? iconIdx : 0);
    }
  }, [isOpen, editingCategory]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!formData.name.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un nombre para la categoría",
      });
      return;
    }

    if (!user?.id) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo identificar el usuario",
      });
      return;
    }

    setIsLoading(true);
    
    try {
      const categoryData = {
        name: formData.name.trim(),
        type: formData.type,
        color: formData.color,
        icon: formData.icon,
      };

      if (isEditing && editingCategory?.id) {
        // Modo edición
        await onUpdate(editingCategory.id, categoryData);
        toast({
          title: "¡Éxito!",
          description: "Categoría actualizada correctamente",
        });
      } else {
        // Modo creación
        await addCategory(categoryData);
        toast({
          title: "¡Éxito!",
          description: "Categoría creada correctamente",
        });
      }
      
      // Reset form
      setFormData({
        name: '',
        type: 'expense',
        color: '#1C8FA0',
        icon: 'Home'
      });
      setSelectedColorIndex(0);
      setSelectedIconIndex(0);
      
      onClose();
      if (onSuccess) onSuccess();
    } catch (error) {
      console.error('Error creating category:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo crear la categoría. Intenta de nuevo.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleColorSelect = (index) => {
    setSelectedColorIndex(index);
    setFormData({ ...formData, color: availableColors[index].hex });
  };

  const handleIconSelect = (index) => {
    setSelectedIconIndex(index);
    setFormData({ ...formData, icon: iconNames[index] });
  };

  const handleTypeSelect = (type) => {
    setFormData({ ...formData, type });
  };

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
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-md shadow-2xl border border-gray-100 dark:border-white/10 z-10"
      >
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-xl font-bold text-[#1a1a1a] dark:text-white">
            {isEditing ? 'Editar Categoría' : 'Nueva Categoría'}
          </h2>
          <button 
            onClick={onClose} 
            disabled={isLoading}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <Icon component={X} size="md" color="default" className="dark:" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Nombre</label>
            <input 
              type="text" 
              placeholder="Ej. Gimnasio" 
              required
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              disabled={isLoading}
              className="w-full px-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all disabled:opacity-50"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Tipo</label>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={() => handleTypeSelect('expense')}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all",
                  formData.type === 'expense'
                    ? "bg-[#1C8FA0] text-white shadow-lg shadow-[#1C8FA0]/20"
                    : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                Gasto
              </button>
              <button
                type="button"
                onClick={() => handleTypeSelect('income')}
                disabled={isLoading}
                className={cn(
                  "flex-1 py-2.5 rounded-xl font-medium text-sm transition-all",
                  formData.type === 'income'
                    ? "bg-[#1C8FA0] text-white shadow-lg shadow-[#1C8FA0]/20"
                    : "bg-white dark:bg-white/5 border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/10",
                  isLoading && "opacity-50 cursor-not-allowed"
                )}
              >
                Ingreso
              </button>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Color</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableColors.map((colorObj, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleColorSelect(i)}
                  disabled={isLoading}
                  className={cn(
                    "w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-transform hover:scale-110",
                    colorObj.bg,
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                >
                  {selectedColorIndex === i && <Icon component={Check} size="sm" color="white" />}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-[#6E6E73] dark:text-gray-400 mb-2">Icono</label>
            <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
              {availableIcons.map((IconComponent, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => handleIconSelect(i)}
                  disabled={isLoading}
                  className={cn(
                    "w-10 h-10 rounded-full shrink-0 flex items-center justify-center transition-all hover:scale-110 border-2",
                    selectedIconIndex === i
                      ? "border-[#1C8FA0] bg-[#1C8FA0]/10"
                      : "border-gray-200 dark:border-white/10 bg-white dark:bg-white/5 hover:border-gray-300",
                    isLoading && "opacity-50 cursor-not-allowed"
                  )}
                  style={selectedIconIndex === i ? { borderColor: formData.color } : {}}
                >
                  <IconComponent 
                    className={cn(
                      "w-5 h-5",
                      selectedIconIndex === i ? "text-[#1C8FA0]" : "text-[#6E6E73] dark:text-gray-400"
                    )}
                    style={selectedIconIndex === i ? { color: formData.color } : {}}
                  />
                </button>
              ))}
            </div>
          </div>

          <div className="pt-4 flex gap-3">
            <button 
              type="button"
              onClick={onClose} 
              disabled={isLoading}
              className="flex-1 py-3 rounded-xl border border-gray-200 dark:border-white/10 text-[#6E6E73] dark:text-gray-400 font-medium hover:bg-gray-50 dark:hover:bg-white/5 transition-colors disabled:opacity-50"
            >
              Cancelar
            </button>
            <button 
              type="submit"
              disabled={isLoading || !formData.name.trim()}
              className="flex-1 py-3 rounded-xl bg-[#1a1a1a] dark:bg-white text-white dark:text-black font-medium hover:bg-black dark:hover:bg-gray-100 transition-colors shadow-lg disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <>
                  <Icon component={Loader2} size="sm" color="default" className="animate-spin" />
                  {isEditing ? 'Actualizando...' : 'Guardando...'}
                </>
              ) : (
                isEditing ? 'Actualizar Categoría' : 'Crear Categoría'
              )}
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const Categories = () => {
  const { user } = useAuth();
  const { categories, loading, refresh, deleteCategory, updateCategory } = useFinance(user?.id);
  const { toast } = useToast();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState(null);

  const handleCategoryAdded = () => {
    refresh(); // Refrescar la lista de categorías
  };

  const handleEdit = (category) => {
    setEditingCategory(category);
    setIsModalOpen(true);
  };

  const handleDelete = async (categoryId) => {
    try {
      await deleteCategory(categoryId);
      refresh();
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo eliminar la categoría. Intenta de nuevo.",
      });
    }
  };

  const handleUpdate = async (categoryId, data) => {
    try {
      await updateCategory(categoryId, data);
      refresh();
      setEditingCategory(null);
      setIsModalOpen(false);
    } catch (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo actualizar la categoría. Intenta de nuevo.",
      });
    }
  };

  return (
    <div className="space-y-8 pb-12">
      <AnimatePresence mode="wait">
        {isModalOpen && (
          <AddCategoryModal 
            key={editingCategory ? `edit-category-modal-${editingCategory.id}` : "add-category-modal"}
            isOpen={isModalOpen} 
            onClose={() => {
              setIsModalOpen(false);
              setEditingCategory(null);
            }}
            onSuccess={handleCategoryAdded}
            editingCategory={editingCategory}
            onUpdate={handleUpdate}
          />
        )}
      </AnimatePresence>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-[#1a1a1a] font-['Inter_Tight']">Categorías</h1>
          <p className="text-[#6E6E73]">Organiza tus gastos para un mejor seguimiento</p>
        </div>
        <div className="flex gap-3">
          <button className="px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-[#6E6E73] font-medium text-sm hover:text-[#1a1a1a] transition-colors shadow-sm flex items-center gap-2">
            <Icon component={GripVertical} size="sm" color="default" />
            Reordenar
          </button>
          <button 
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2.5 bg-[#1a1a1a] text-white rounded-xl text-sm font-medium hover:bg-black transition-colors shadow-lg shadow-black/10 flex items-center gap-2"
          >
            <Icon component={Plus} size="sm" color="default" />
            Agregar Categoría
          </button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid md:grid-cols-3 gap-6">
        <div className="bg-[#1C8FA0]/5 rounded-2xl p-5 border border-[#1C8FA0]/10">
          <p className="text-xs font-bold text-[#1C8FA0] uppercase tracking-wider mb-1">Top Gasto</p>
          <p className="text-lg font-bold text-[#1a1a1a]">Hogar</p>
          <p className="text-sm text-[#6E6E73]">$980.00 este mes</p>
        </div>
        <div className="bg-[#E47B45]/5 rounded-2xl p-5 border border-[#E47B45]/10">
          <p className="text-xs font-bold text-[#E47B45] uppercase tracking-wider mb-1">Mayor Ahorro</p>
          <p className="text-lg font-bold text-[#1a1a1a]">Viajes</p>
          <p className="text-sm text-[#6E6E73]">+15% vs mes anterior</p>
        </div>
        <div className="bg-gray-50 rounded-2xl p-5 border border-gray-100">
          <p className="text-xs font-bold text-[#6E6E73] uppercase tracking-wider mb-1">Total Categorías</p>
          <p className="text-lg font-bold text-[#1a1a1a]">8 Activas</p>
          <p className="text-sm text-[#6E6E73]">2 Archivadas</p>
        </div>
      </div>

      {/* Categories Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {loading ? (
          <div className="col-span-full flex items-center justify-center py-12">
            <Icon component={Loader2} size="xl" color="primary" className="animate-spin" />
          </div>
        ) : categories && categories.length > 0 ? (
          categories.map((cat, index) => {
            // Mapear icono desde string a componente
            const iconIndex = iconNames.indexOf(cat.icon || 'Home');
            const IconComponent = availableIcons[iconIndex >= 0 ? iconIndex : 0] || Home;
            
            // Obtener color (hex o clase)
            const categoryColor = cat.color || '#1C8FA0';
            const isHexColor = categoryColor.startsWith('#');
            
            const categoryWithIcon = {
              ...cat,
              icon: IconComponent,
              color: categoryColor, // Guardar el color original (hex o clase)
              colorHex: isHexColor ? categoryColor : undefined, // Para usar con style
              colorClass: !isHexColor ? categoryColor : undefined, // Para usar con className
              type: cat.type === 'expense' ? 'Gasto' : cat.type === 'income' ? 'Ingreso' : (cat.type || 'Gasto'),
              amount: 0 // Se calcularía desde transacciones
            };
            return (
              <CategoryCard 
                key={cat.id} 
                category={categoryWithIcon} 
                delay={index * 0.1}
                onEdit={handleEdit}
                onDelete={handleDelete}
              />
            );
          })
        ) : null}
        
        {/* Mostrar datos mock si no hay categorías de Supabase o mientras carga */}
        {(!categories || categories.length === 0) && !loading && (
          <>
            {categoriesData.map((cat, index) => (
              <CategoryCard key={cat.id} category={cat} delay={index * 0.1} />
            ))}
          </>
        )}
        
        {/* Add New Card Placeholder */}
        <motion.button
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
          onClick={() => setIsModalOpen(true)}
          className="border-2 border-dashed border-gray-200 rounded-[22px] p-6 flex flex-col items-center justify-center gap-3 text-[#6E6E73] hover:border-[#1C8FA0] hover:text-[#1C8FA0] hover:bg-[#1C8FA0]/5 transition-all group h-full min-h-[200px]"
        >
          <div className="w-12 h-12 rounded-full bg-gray-50 flex items-center justify-center group-hover:bg-white group-hover:shadow-md transition-all">
            <Icon component={Plus} size="lg" color="default" />
          </div>
          <span className="font-medium">Crear Nueva</span>
        </motion.button>
      </div>
    </div>
  );
};

export default Categories;