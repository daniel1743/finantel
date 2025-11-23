import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, User, Mail, Lock, Camera, Loader2, CheckCircle2, AlertCircle, Upload, Crown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { supabase } from '@/lib/customSupabaseClient';
import { useToast } from '@/components/ui/use-toast';
import { compressImage, isValidImage } from '@/lib/imageUtils';
import { useBilling } from '@/hooks/useBilling';

// Estilos de letras para plan gratis
const FONT_STYLES = [
  { name: 'Bold', value: 'bold', class: 'font-bold' },
  { name: 'Semi Bold', value: 'semibold', class: 'font-semibold' },
  { name: 'Medium', value: 'medium', class: 'font-medium' },
  { name: 'Regular', value: 'regular', class: 'font-normal' },
  { name: 'Light', value: 'light', class: 'font-light' },
];

// Colores para avatar (plan gratis)
const AVATAR_COLORS = [
  { name: 'Azul', value: '#1C8FA0', bg: 'bg-[#1C8FA0]' },
  { name: 'Naranja', value: '#E47B45', bg: 'bg-[#E47B45]' },
  { name: 'Verde', value: '#10B981', bg: 'bg-[#10B981]' },
  { name: 'Púrpura', value: '#8B5CF6', bg: 'bg-[#8B5CF6]' },
  { name: 'Rosa', value: '#EC4899', bg: 'bg-[#EC4899]' },
];

const EditProfileModal = ({ isOpen, onClose, onUpdate, initialTab = 'profile' }) => {
  const { user } = useAuth();
  const { subscription } = useBilling(user?.id);
  const { toast } = useToast();
  const fileInputRef = useRef(null);
  
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [activeTab, setActiveTab] = useState(initialTab); // 'profile', 'email', 'password'
  
  // Datos del formulario
  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  
  // Avatar (plan gratis)
  const [avatarStyle, setAvatarStyle] = useState({
    fontStyle: 'bold',
    color: '#1C8FA0',
  });
  
  // Foto de perfil (plan pago)
  const [profilePhoto, setProfilePhoto] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [photoUrl, setPhotoUrl] = useState(null);

  const isFreePlan = !subscription || subscription?.plan === 'free';

  useEffect(() => {
    if (isOpen && user) {
      setActiveTab(initialTab);
      setFormData({
        fullName: user.user_metadata?.full_name || '',
        email: user.email || '',
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      
      // Cargar foto de perfil si existe
      if (user.user_metadata?.avatar_url) {
        setPhotoUrl(user.user_metadata.avatar_url);
      }
      
      // Cargar preferencias de avatar si es plan gratis
      if (isFreePlan) {
        loadAvatarPreferences();
      }
    }
  }, [isOpen, user, isFreePlan, initialTab]);

  const loadAvatarPreferences = async () => {
    try {
      const { data } = await supabase
        .from('profile_preferences')
        .select('avatar_font_style, avatar_color')
        .eq('user_id', user.id)
        .maybeSingle();

      if (data) {
        setAvatarStyle({
          fontStyle: data.avatar_font_style || 'bold',
          color: data.avatar_color || '#1C8FA0',
        });
      }
    } catch (error) {
      console.error('Error loading avatar preferences:', error);
    }
  };

  const handlePhotoSelect = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!isValidImage(file)) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor selecciona una imagen válida (JPG, PNG, WEBP, máximo 10MB)",
      });
      return;
    }

    setUploading(true);
    try {
      // Comprimir imagen a 2MB
      const compressedFile = await compressImage(file, 2);
      
      setProfilePhoto(compressedFile);
      
      // Crear preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setPhotoPreview(e.target.result);
      };
      reader.readAsDataURL(compressedFile);
      
      // Subir a Supabase Storage
      await uploadPhoto(compressedFile);
    } catch (error) {
      console.error('Error processing image:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo procesar la imagen. Intenta con otra.",
      });
    } finally {
      setUploading(false);
    }
  };

  const uploadPhoto = async (file) => {
    setVerifying(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${user.id}-${Date.now()}.${fileExt}`;
      const filePath = fileName; // No usar carpeta, solo el nombre del archivo

      // Verificar que el bucket existe
      const { data: buckets, error: bucketError } = await supabase.storage.listBuckets();
      
      if (bucketError) {
        throw new Error('No se pudo acceder al storage. Contacta al administrador.');
      }

      const avatarsBucket = buckets?.find(b => b.name === 'avatars');
      if (!avatarsBucket) {
        throw new Error('El bucket de avatares no está configurado. Por favor, contacta al administrador.');
      }

      // Subir a Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file, {
          cacheControl: '3600',
          upsert: true,
        });

      if (uploadError) {
        // Si el error es que el archivo ya existe, intentar actualizar
        if (uploadError.message?.includes('already exists')) {
          const { error: updateError } = await supabase.storage
            .from('avatars')
            .update(filePath, file, {
              cacheControl: '3600',
            });
          
          if (updateError) throw updateError;
        } else {
          throw uploadError;
        }
      }

      // Obtener URL pública
      const { data: { publicUrl } } = supabase.storage
        .from('avatars')
        .getPublicUrl(filePath);

      // Actualizar metadata del usuario
      const { error: updateError } = await supabase.auth.updateUser({
        data: {
          avatar_url: publicUrl,
          avatar_verification_status: 'pending', // Estado de verificación
        },
      });

      if (updateError) throw updateError;

      setPhotoUrl(publicUrl);
      
      toast({
        title: "Foto subida",
        description: "Estamos verificando tu foto. En breve la podrás ver.",
      });

      // Simular verificación (en producción esto sería un proceso del backend)
      setTimeout(() => {
        setVerifying(false);
        toast({
          title: "Foto verificada",
          description: "Tu foto de perfil está lista.",
        });
      }, 3000);
    } catch (error) {
      console.error('Error uploading photo:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo subir la foto. Intenta de nuevo.",
      });
      setVerifying(false);
    }
  };

  const handleSaveProfile = async () => {
    if (!formData.fullName.trim()) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "El nombre no puede estar vacío",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        data: {
          full_name: formData.fullName.trim(),
        },
      });

      if (error) throw error;

      toast({
        title: "¡Actualizado!",
        description: "Tu nombre ha sido actualizado",
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating profile:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el perfil",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveEmail = async () => {
    if (!formData.email.trim() || !formData.email.includes('@')) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor ingresa un correo válido",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        email: formData.email.trim(),
      });

      if (error) throw error;

      toast({
        title: "Correo actualizado",
        description: "Por favor verifica tu nuevo correo electrónico",
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating email:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar el correo",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSavePassword = async () => {
    if (!formData.currentPassword || !formData.newPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Por favor completa todos los campos",
      });
      return;
    }

    if (formData.newPassword !== formData.confirmPassword) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Las contraseñas no coinciden",
      });
      return;
    }

    if (formData.newPassword.length < 6) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "La contraseña debe tener al menos 6 caracteres",
      });
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: formData.newPassword,
      });

      if (error) throw error;

      toast({
        title: "¡Contraseña actualizada!",
        description: "Tu contraseña ha sido cambiada exitosamente",
      });

      setFormData({
        ...formData,
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error updating password:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message || "No se pudo actualizar la contraseña",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSaveAvatar = async () => {
    setLoading(true);
    try {
      const { error } = await supabase
        .from('profile_preferences')
        .upsert({
          user_id: user.id,
          avatar_font_style: avatarStyle.fontStyle,
          avatar_color: avatarStyle.color,
          updated_at: new Date().toISOString(),
        }, {
          onConflict: 'user_id'
        });

      if (error) throw error;

      toast({
        title: "¡Actualizado!",
        description: "Tu avatar ha sido actualizado",
      });

      onUpdate?.();
      onClose();
    } catch (error) {
      console.error('Error saving avatar:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "No se pudo guardar el avatar",
      });
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  const getInitial = () => {
    return (formData.fullName || user?.email || 'U').charAt(0).toUpperCase();
  };

  const getFontClass = (style) => {
    return FONT_STYLES.find(s => s.value === style)?.class || 'font-bold';
  };

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
        className="relative bg-white dark:bg-[#1a1a1a] rounded-[26px] p-8 w-full max-w-2xl shadow-2xl border border-gray-100 dark:border-white/10 z-10 max-h-[90vh] overflow-y-auto"
      >
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-2xl font-bold text-[#1a1a1a] dark:text-white">Editar Perfil</h2>
            <p className="text-sm text-[#6E6E73] dark:text-gray-400 mt-1">
              Actualiza tu información personal
            </p>
          </div>
          <button
            onClick={onClose}
            disabled={loading || uploading || verifying}
            className="p-2 hover:bg-gray-100 dark:hover:bg-white/5 rounded-full transition-colors disabled:opacity-50"
          >
            <X className="w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6 border-b border-gray-100 dark:border-white/10">
          <button
            onClick={() => setActiveTab('profile')}
            data-tab="profile"
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'profile'
                ? 'border-[#1C8FA0] text-[#1C8FA0]'
                : 'border-transparent text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white'
            }`}
          >
            Perfil
          </button>
          <button
            onClick={() => setActiveTab('email')}
            data-tab="email"
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'email'
                ? 'border-[#1C8FA0] text-[#1C8FA0]'
                : 'border-transparent text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white'
            }`}
          >
            Correo
          </button>
          <button
            onClick={() => setActiveTab('password')}
            data-tab="password"
            className={`px-4 py-2 text-sm font-medium transition-colors border-b-2 ${
              activeTab === 'password'
                ? 'border-[#1C8FA0] text-[#1C8FA0]'
                : 'border-transparent text-[#6E6E73] dark:text-gray-400 hover:text-[#1a1a1a] dark:hover:text-white'
            }`}
          >
            Contraseña
          </button>
        </div>

        {/* Tab Content */}
        <AnimatePresence mode="wait">
          {activeTab === 'profile' && (
            <motion.div
              key="profile"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              {/* Foto de Perfil */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-3">
                  Foto de Perfil
                </label>
                
                {isFreePlan ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 p-4 bg-yellow-50 dark:bg-yellow-900/10 rounded-xl border border-yellow-200 dark:border-yellow-900/20">
                      <Crown className="w-5 h-5 text-yellow-600 dark:text-yellow-400" />
                      <p className="text-sm text-yellow-800 dark:text-yellow-200">
                        Actualiza a un plan de pago para subir tu foto de perfil
                      </p>
                    </div>
                    
                    {/* Avatar Personalizado */}
                    <div className="space-y-4">
                      <div className="flex justify-center">
                        <div
                          className="w-24 h-24 rounded-full flex items-center justify-center text-white text-3xl shadow-lg"
                          style={{ backgroundColor: avatarStyle.color }}
                        >
                          <span className={getFontClass(avatarStyle.fontStyle)}>
                            {getInitial()}
                          </span>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                          Estilo de Letra
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {FONT_STYLES.map((style) => (
                            <button
                              key={style.value}
                              onClick={() => setAvatarStyle({ ...avatarStyle, fontStyle: style.value })}
                              className={`p-3 rounded-xl border-2 transition-all ${
                                avatarStyle.fontStyle === style.value
                                  ? 'border-[#1C8FA0] bg-[#1C8FA0]/10'
                                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300'
                              }`}
                            >
                              <span className={`text-lg ${style.class}`}>A</span>
                            </button>
                          ))}
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                          Color
                        </label>
                        <div className="grid grid-cols-5 gap-2">
                          {AVATAR_COLORS.map((color) => (
                            <button
                              key={color.value}
                              onClick={() => setAvatarStyle({ ...avatarStyle, color: color.value })}
                              className={`w-full h-12 rounded-xl border-2 transition-all ${
                                avatarStyle.color === color.value
                                  ? 'border-[#1C8FA0] ring-2 ring-offset-2 ring-[#1C8FA0]/50'
                                  : 'border-gray-200 dark:border-white/10 hover:border-gray-300'
                              }`}
                              style={{ backgroundColor: color.value }}
                            />
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-4">
                    <div className="flex justify-center">
                      <div className="relative">
                        {verifying ? (
                          <div className="w-24 h-24 rounded-full bg-gray-100 dark:bg-white/5 flex items-center justify-center border-2 border-dashed border-[#1C8FA0]">
                            <Loader2 className="w-8 h-8 text-[#1C8FA0] animate-spin" />
                          </div>
                        ) : photoUrl || photoPreview ? (
                          <img
                            src={photoPreview || photoUrl}
                            alt="Profile"
                            className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-lg"
                          />
                        ) : (
                          <div className="w-24 h-24 rounded-full bg-gradient-to-br from-[#1C8FA0] to-[#167a8a] flex items-center justify-center text-white text-3xl">
                            {getInitial()}
                          </div>
                        )}
                        <button
                          onClick={() => fileInputRef.current?.click()}
                          disabled={uploading || verifying}
                          className="absolute bottom-0 right-0 w-8 h-8 bg-[#1C8FA0] rounded-full text-white flex items-center justify-center shadow-lg hover:scale-110 transition-transform disabled:opacity-50"
                        >
                          {uploading || verifying ? (
                            <Loader2 className="w-4 h-4 animate-spin" />
                          ) : (
                            <Camera className="w-4 h-4" />
                          )}
                        </button>
                        <input
                          ref={fileInputRef}
                          type="file"
                          accept="image/*"
                          onChange={handlePhotoSelect}
                          className="hidden"
                          disabled={uploading || verifying}
                        />
                      </div>
                    </div>

                    {verifying && (
                      <div className="flex items-center gap-2 p-3 bg-blue-50 dark:bg-blue-900/10 rounded-xl border border-blue-200 dark:border-blue-900/20">
                        <Loader2 className="w-4 h-4 text-blue-600 dark:text-blue-400 animate-spin" />
                        <p className="text-sm text-blue-800 dark:text-blue-200">
                          Estamos verificando tu foto. En breve la podrás ver.
                        </p>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Nombre */}
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                  Nombre Completo
                </label>
                <div className="relative">
                  <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
                  <input
                    type="text"
                    value={formData.fullName}
                    onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                    placeholder="Tu nombre completo"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={loading || uploading || verifying}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={isFreePlan ? handleSaveAvatar : handleSaveProfile}
                  disabled={loading || uploading || verifying}
                  className="flex-1 bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100"
                >
                  {loading ? 'Guardando...' : 'Guardar Cambios'}
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'email' && (
            <motion.div
              key="email"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                  Correo Electrónico
                </label>
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                    placeholder="tu@correo.com"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
                    disabled={loading}
                  />
                </div>
                <p className="text-xs text-[#6E6E73] dark:text-gray-400 mt-2">
                  Recibirás un correo de verificación en tu nueva dirección
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSaveEmail}
                  disabled={loading}
                  className="flex-1 bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100"
                >
                  {loading ? 'Actualizando...' : 'Actualizar Correo'}
                </Button>
              </div>
            </motion.div>
          )}

          {activeTab === 'password' && (
            <motion.div
              key="password"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-6"
            >
              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                  Contraseña Actual
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
                  <input
                    type="password"
                    value={formData.currentPassword}
                    onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
                    placeholder="Tu contraseña actual"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                  Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
                  <input
                    type="password"
                    value={formData.newPassword}
                    onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
                    placeholder="Mínimo 6 caracteres"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-[#1a1a1a] dark:text-white mb-2">
                  Confirmar Nueva Contraseña
                </label>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-[#6E6E73] dark:text-gray-400" />
                  <input
                    type="password"
                    value={formData.confirmPassword}
                    onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
                    placeholder="Confirma tu nueva contraseña"
                    className="w-full pl-12 pr-4 py-3 bg-gray-50 dark:bg-white/5 border border-gray-200 dark:border-white/10 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#1C8FA0]/20 focus:border-[#1C8FA0] transition-all"
                    disabled={loading}
                  />
                </div>
              </div>

              <div className="flex gap-3 pt-4">
                <Button
                  onClick={onClose}
                  variant="outline"
                  disabled={loading}
                  className="flex-1"
                >
                  Cancelar
                </Button>
                <Button
                  onClick={handleSavePassword}
                  disabled={loading}
                  className="flex-1 bg-[#1a1a1a] dark:bg-white text-white dark:text-black hover:bg-black dark:hover:bg-gray-100"
                >
                  {loading ? 'Actualizando...' : 'Cambiar Contraseña'}
                </Button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
};

export default EditProfileModal;

