
import React, { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useBilling } from '@/hooks/useBilling';
import { useStaffTickets } from '@/hooks/useStaffTickets';
import { Lock } from 'lucide-react';
import { 
  LayoutDashboard, 
  Compass, 
  CreditCard, 
  Layers, 
  Target, 
  Receipt,
  Bot, 
  Sparkles, 
  BarChart3, 
  Bell,
  Users, 
  Share2, 
  ArrowLeftRight,
  LogOut,
  Settings,
  User,
  Download,
  Shield,
  Zap,
  TrendingUp,
  ChevronDown,
  ChevronRight,
  Wrench,
  Home,
  Inbox
} from 'lucide-react';

const MenuItem = ({ item, isActive, isBlocked, setIsMobileOpen, handleBlockedClick, isCollapsed }) => {
        const Icon = item.icon;
        
        return (
    <div className="relative group/item">
            {isBlocked && (
              <>
                <div className="absolute -top-1 -right-1 z-10">
                  <Lock className="w-4 h-4 text-amber-500" />
                </div>
                <div className="absolute left-full ml-2 top-1/2 -translate-y-1/2 bg-[#1a1a1a] dark:bg-white text-white dark:text-[#1a1a1a] text-xs px-3 py-2 rounded-lg opacity-0 group-hover/item:opacity-100 pointer-events-none whitespace-nowrap z-50 transition-opacity shadow-lg">
                  Requiere Plan Familiar
                  <div className="absolute left-0 top-1/2 -translate-y-1/2 -translate-x-1 w-2 h-2 bg-[#1a1a1a] dark:bg-white rotate-45"></div>
                </div>
              </>
            )}
            <Link
              to={item.path}
              onClick={(e) => {
                if (isBlocked) {
                  handleBlockedClick(e);
                } else {
                  setIsMobileOpen(false);
                }
              }}
              className={cn(
                "group flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 relative overflow-hidden",
                isActive 
                  ? "bg-[#1C8FA0]/10 text-[#1C8FA0]" 
                  : "text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white",
                isBlocked && "opacity-60"
              )}
            >
            {isActive && (
              <div className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-[#1C8FA0] rounded-r-full" />
            )}
            
            <Icon className={cn(
              "w-5 h-5 transition-all duration-300",
              isActive ? "text-[#1C8FA0] drop-shadow-[0_0_8px_rgba(28,143,160,0.5)]" : "group-hover:scale-110",
              isCollapsed ? "mx-auto" : ""
            )} />
            
            <span className={cn(
              "font-medium text-sm whitespace-nowrap transition-all duration-300",
              isCollapsed ? "opacity-0 w-0 overflow-hidden" : "opacity-100 w-auto"
            )}>
              {item.name}
            </span>
          </Link>
          </div>
  );
};

const MenuSection = ({ title, items, isCollapsed, currentPath, setIsMobileOpen, hasFamilyPlan, handleBlockedClick }) => (
  <div className="mb-6">
    {title && (
      <h3 className={cn(
        "text-xs font-bold text-[#6E6E73]/60 dark:text-gray-500 uppercase tracking-wider mb-3 px-4 transition-all duration-300",
        isCollapsed ? "opacity-0 h-0 mb-0 overflow-hidden" : "opacity-100"
      )}>
        {title}
      </h3>
    )}
    <div className="space-y-1">
      {items.map((item) => {
        const isActive = currentPath === item.path;
        const isFamilyFeature = item.requiresFamilyPlan;
        const isBlocked = isFamilyFeature && !hasFamilyPlan;
        
        return (
          <MenuItem
            key={item.name}
            item={item}
            isActive={isActive}
            isBlocked={isBlocked}
            setIsMobileOpen={setIsMobileOpen}
            handleBlockedClick={handleBlockedClick}
            isCollapsed={isCollapsed}
          />
        );
      })}
    </div>
  </div>
);

const CollapsibleMenuSection = ({ title, icon: SectionIcon, items, currentPath, setIsMobileOpen, hasFamilyPlan, handleBlockedClick, defaultOpen = false }) => {
  const [isOpen, setIsOpen] = useState(defaultOpen);
  
  // Auto-abrir si alguna ruta está activa
  useEffect(() => {
    const hasActiveItem = items.some(item => currentPath === item.path);
    if (hasActiveItem) {
      setIsOpen(true);
    }
  }, [currentPath, items]);

  const hasActiveItem = items.some(item => currentPath === item.path);

  return (
    <div className="mb-6">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className={cn(
          "w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-300 mb-1 group",
          hasActiveItem
            ? "bg-[#1C8FA0]/10 text-[#1C8FA0]"
            : "text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white"
        )}
      >
        {SectionIcon && (
          <SectionIcon className={cn(
            "w-5 h-5 transition-all duration-300",
            hasActiveItem && "text-[#1C8FA0] drop-shadow-[0_0_8px_rgba(28,143,160,0.5)]"
          )} />
        )}
        <span className="font-semibold text-sm flex-1 text-left">{title}</span>
        <div className={cn(
          "transition-transform duration-300",
          isOpen ? "rotate-0" : "-rotate-90"
        )}>
          <ChevronDown className="w-4 h-4" />
        </div>
      </button>
      
      <div className={cn(
        "space-y-1 overflow-hidden transition-all duration-300 ease-in-out",
        isOpen ? "max-h-[1000px] opacity-100 mt-1" : "max-h-0 opacity-0"
      )}>
        {items.map((item) => {
          const isActive = currentPath === item.path;
          const isFamilyFeature = item.requiresFamilyPlan;
          const isBlocked = isFamilyFeature && !hasFamilyPlan;
          
          return (
            <div key={item.name} className="pl-4">
              <MenuItem
                item={item}
                isActive={isActive}
                isBlocked={isBlocked}
                setIsMobileOpen={setIsMobileOpen}
                handleBlockedClick={handleBlockedClick}
                isCollapsed={false}
              />
            </div>
          );
        })}
      </div>
    </div>
  );
};

const Sidebar = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const { signOut, user } = useAuth();
  const { subscription, loading: billingLoading } = useBilling(user?.id);
  const { isStaff, checkingStaff } = useStaffTickets(user?.id);
  const navigate = useNavigate();

  // Verificar si tiene plan familiar (solo si subscription existe y no está cargando)
  const hasFamilyPlan = !billingLoading && subscription && (
    subscription.plan === 'familiar' || 
    subscription.plan === 'family' || 
    subscription.plan === 'Familiar'
  );

  // Cerrar el menú móvil automáticamente cuando cambia la ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [currentPath, setIsMobileOpen]);

  // Manejar clic en enlaces bloqueados - permite navegar pero mostrará UpgradeRequired
  const handleBlockedClick = (e) => {
    // No prevenir el comportamiento por defecto, dejar que navegue
    // El componente ProtectedFamilyRoute mostrará UpgradeRequired
    setIsMobileOpen(false);
  };

  const menuStructure = [
    {
      title: "Panel Principal",
      items: [
        { name: "Dashboard", icon: LayoutDashboard, path: "/dashboard" },
        { name: "Visión General", icon: Compass, path: "/dashboard/overview" },
        { name: "Transacciones", icon: CreditCard, path: "/dashboard/transactions" },
        { name: "Metas y Ahorros", icon: Target, path: "/dashboard/goals" },
      ]
    },
    {
      type: "collapsible",
      title: "Servicios y Presupuestos",
      icon: Wrench,
      items: [
        { name: "Servicios", icon: Layers, path: "/dashboard/categories" },
        { name: "Presupuestos", icon: Receipt, path: "/dashboard/budgets" },
      ]
    },
    {
      type: "collapsible",
      title: "IA Financiera",
      icon: Bot,
      items: [
        { name: "Asistente IA", icon: Bot, path: "/dashboard/ai-assistant" },
        { name: "Planificador IA", icon: Zap, path: "/dashboard/ai-planner" },
        { name: "Simulador de Futuro", icon: TrendingUp, path: "/dashboard/future-self" },
        { name: "Predicciones", icon: Sparkles, path: "/dashboard/predictions" },
        { name: "Análisis Profundo", icon: BarChart3, path: "/dashboard/analysis" },
        { name: "Alertas", icon: Bell, path: "/dashboard/alerts" },
      ]
    },
    {
      type: "collapsible",
      title: "Centro Familiar",
      icon: Home,
      items: [
        { name: "Mi Familia", icon: Users, path: "/dashboard/family", requiresFamilyPlan: true },
        { name: "Gastos Compartidos", icon: Share2, path: "/dashboard/shared", requiresFamilyPlan: true },
        { name: "Deudas", icon: ArrowLeftRight, path: "/dashboard/debts", requiresFamilyPlan: true },
      ]
    },
    {
      title: "Herramientas",
      items: [
        { name: "Exportar Datos", icon: Download, path: "/dashboard/export" },
        { name: "Centro de Ayuda", icon: Bell, path: "/dashboard/support" },
      ]
    }
  ];

  // Agregar sección de administración solo si es staff
  if (!checkingStaff && isStaff) {
    menuStructure.push({
      title: "Administración",
      items: [
        { name: "Panel de Soporte", icon: Shield, path: "/dashboard/admin/support" },
        { name: "Webhook Inbox", icon: Inbox, path: "/dashboard/admin/webhooks" },
        { name: "Notificaciones", icon: Bell, path: "/dashboard/admin/system-notifications" },
      ]
    });
  }

  return (
    <>
      {/* Mobile Overlay */}
      <div 
        className={cn(
          "fixed inset-0 bg-black/20 backdrop-blur-sm z-40 lg:hidden transition-opacity duration-300",
          isMobileOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={() => setIsMobileOpen(false)}
      />

      {/* Sidebar Container */}
      <aside className={cn(
        "fixed lg:static inset-y-0 left-0 z-50 bg-white dark:bg-[#1a1a1a] border-r border-gray-100 dark:border-white/5 shadow-[inset_-1px_0_0_0_rgba(0,0,0,0.05)] transition-all duration-300 ease-in-out flex flex-col",
        "w-[280px]", // Fixed width for desktop
        isMobileOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
      )}>
        {/* Logo Section */}
        <div className="h-24 flex items-center justify-center border-b border-gray-50/50 dark:border-white/5">
          <Link 
            to="/dashboard" 
            className="flex items-center gap-3 cursor-pointer hover:opacity-80 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          >
            <img
              src="/finantel-logo.png"
              alt="Finantel Logo"
              className="w-10 h-10 rounded-xl shadow-lg shadow-[#1C8FA0]/20 object-contain"
            />
            <span className="text-xl font-bold tracking-tight text-[#1a1a1a] dark:text-white font-['Inter_Tight']">
              FINANTEL
            </span>
          </Link>
        </div>

        {/* Scrollable Menu */}
        <div className="flex-1 overflow-y-auto py-8 px-4 space-y-8 scrollbar-hide">
          {menuStructure.map((section, idx) => {
            if (section.type === "collapsible") {
              return (
                <CollapsibleMenuSection
                  key={idx}
                  title={section.title}
                  icon={section.icon}
                  items={section.items}
                  currentPath={currentPath}
                  setIsMobileOpen={setIsMobileOpen}
                  hasFamilyPlan={hasFamilyPlan}
                  handleBlockedClick={handleBlockedClick}
                />
              );
            }
            return (
            <MenuSection 
              key={idx} 
              title={section.title} 
              items={section.items} 
              currentPath={currentPath}
              isCollapsed={false}
              setIsMobileOpen={setIsMobileOpen}
              hasFamilyPlan={hasFamilyPlan}
              handleBlockedClick={handleBlockedClick}
            />
            );
          })}
        </div>

        {/* Bottom Actions */}
        <div className="p-4 border-t border-gray-50 dark:border-white/5 space-y-1">
          <Link 
            to="/dashboard/profile" 
            onClick={() => setIsMobileOpen(false)}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#6E6E73] dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-white/5 hover:text-[#1a1a1a] dark:hover:text-white transition-all group"
          >
            <User className="w-5 h-5 group-hover:scale-110 transition-transform" />
            <span className="font-medium text-sm">Mi Perfil</span>
          </Link>
          <button 
            onClick={signOut}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-[#6E6E73] dark:text-gray-400 hover:bg-red-50 dark:hover:bg-red-900/10 hover:text-red-600 transition-all group"
          >
            <LogOut className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
            <span className="font-medium text-sm">Cerrar Sesión</span>
          </button>
        </div>
      </aside>
    </>
  );
};

export default Sidebar;
