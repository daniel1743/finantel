// =====================================================
// SIDEBAR MUI - AdminMart Style
// =====================================================
// Sidebar convertido a Material UI estilo AdminMart
// Mantiene toda la funcionalidad existente (auth, routing, billing, etc.)
// =====================================================

import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  Drawer,
  Box,
  List,
  Divider,
  Avatar,
  Typography,
  IconButton,
  useTheme as useMUITheme,
  useMediaQuery,
  Tooltip,
  Chip,
} from '@mui/material';
import { ThemeProvider } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

// Material Icons
import MenuOutlined from '@mui/icons-material/MenuOutlined';
import DarkModeOutlined from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlined from '@mui/icons-material/LightModeOutlined';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import VisibilityOutlinedIcon from '@mui/icons-material/VisibilityOutlined';
import SwapHorizOutlinedIcon from '@mui/icons-material/SwapHorizOutlined';
import TrendingUpOutlinedIcon from '@mui/icons-material/TrendingUpOutlined';
import SettingsOutlinedIcon from '@mui/icons-material/SettingsOutlined';
import AccountBalanceOutlinedIcon from '@mui/icons-material/AccountBalanceOutlined';
import HomeOutlinedIcon from '@mui/icons-material/HomeOutlined';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import HelpOutlineIcon from '@mui/icons-material/HelpOutline';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import LockIcon from '@mui/icons-material/Lock';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import ShieldOutlinedIcon from '@mui/icons-material/ShieldOutlined';
import InboxOutlinedIcon from '@mui/icons-material/InboxOutlined';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import BarChartOutlinedIcon from '@mui/icons-material/BarChartOutlined';
import LayersOutlinedIcon from '@mui/icons-material/LayersOutlined';
import ReceiptOutlinedIcon from '@mui/icons-material/ReceiptOutlined';
import SmartToyOutlinedIcon from '@mui/icons-material/SmartToyOutlined';
import BoltOutlinedIcon from '@mui/icons-material/BoltOutlined';
import AutoGraphOutlinedIcon from '@mui/icons-material/AutoGraphOutlined';
import AnalyticsOutlinedIcon from '@mui/icons-material/AnalyticsOutlined';
import PsychologyOutlinedIcon from '@mui/icons-material/PsychologyOutlined';
import PeopleOutlinedIcon from '@mui/icons-material/PeopleOutlined';
import ShareOutlinedIcon from '@mui/icons-material/ShareOutlined';
import SwapHorizIcon from '@mui/icons-material/SwapHoriz';
import BuildOutlinedIcon from '@mui/icons-material/BuildOutlined';

import { useAuth } from '@/contexts/SupabaseAuthContext';
import { useBilling } from '@/hooks/useBilling';
import { useStaffTickets } from '@/hooks/useStaffTickets';
import { useTheme } from '@/contexts/ThemeContext';
import { lightTheme, darkTheme } from '@/theme/muiTheme';
import SidebarSection from './sidebar/SidebarSection';
import SidebarMenuItem from './sidebar/SidebarMenuItem';
import SidebarMenuItemExpandable from './sidebar/SidebarMenuItemExpandable';

const SidebarMUI = ({ isMobileOpen, setIsMobileOpen }) => {
  const location = useLocation();
  const currentPath = location.pathname;
  const navigate = useNavigate();
  const { signOut, user } = useAuth();
  const { subscription, loading: billingLoading } = useBilling(user?.id);
  const { isStaff, checkingStaff } = useStaffTickets(user?.id);
  const { theme: appTheme, toggleTheme } = useTheme();
  const muiTheme = useMUITheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));

  const [isCollapsed, setIsCollapsed] = useState(false);
  const [expandedMenus, setExpandedMenus] = useState({});

  // Verificar si tiene plan familiar
  const hasFamilyPlan = !billingLoading && subscription && (
    subscription.plan === 'familiar' || 
    subscription.plan === 'family' || 
    subscription.plan === 'Familiar'
  );

  // Cerrar el menú móvil automáticamente cuando cambia la ruta
  useEffect(() => {
    setIsMobileOpen(false);
  }, [currentPath, setIsMobileOpen]);

  // Auto-expandir menús si alguna ruta está activa
  useEffect(() => {
    const newExpanded = {};
    menuStructure.forEach((section) => {
      if (section.type === 'collapsible') {
        const hasActive = section.items.some(item => currentPath === item.path);
        if (hasActive) {
          newExpanded[section.key] = true;
        }
      }
    });
    setExpandedMenus(newExpanded);
  }, [currentPath]);

  const handleMenuToggle = (menuKey) => {
    setExpandedMenus(prev => ({
      ...prev,
      [menuKey]: !prev[menuKey]
    }));
  };

  const handleBlockedClick = (e) => {
    e.preventDefault();
    // El componente ProtectedFamilyRoute mostrará UpgradeRequired
    setIsMobileOpen(false);
  };

  // Mapeo de iconos Lucide a Material Icons
  const iconMap = {
    LayoutDashboard: DashboardOutlinedIcon,
    Compass: VisibilityOutlinedIcon,
    CreditCard: SwapHorizOutlinedIcon,
    Target: TrendingUpOutlinedIcon,
    Wrench: SettingsOutlinedIcon,
    Layers: LayersOutlinedIcon,
    Receipt: ReceiptOutlinedIcon,
    Bot: SmartToyOutlinedIcon,
    Zap: BoltOutlinedIcon,
    TrendingUp: AutoGraphOutlinedIcon,
    Sparkles: PsychologyOutlinedIcon,
    BarChart3: AnalyticsOutlinedIcon,
    Bell: NotificationsOutlinedIcon,
    Home: HomeOutlinedIcon,
    Users: PeopleOutlinedIcon,
    Share2: ShareOutlinedIcon,
    ArrowLeftRight: SwapHorizIcon,
    Download: FileDownloadOutlinedIcon,
    User: AccountCircleOutlinedIcon,
    LogOut: LogoutOutlinedIcon,
    Shield: ShieldOutlinedIcon,
    Inbox: InboxOutlinedIcon,
  };

  const menuStructure = [
    {
      title: "Panel Principal",
      items: [
        { name: "Dashboard", icon: DashboardOutlinedIcon, path: "/dashboard" },
        { name: "Visión General", icon: VisibilityOutlinedIcon, path: "/dashboard/overview" },
        { name: "Transacciones", icon: SwapHorizOutlinedIcon, path: "/dashboard/transactions" },
        { name: "Metas y Ahorros", icon: TrendingUpOutlinedIcon, path: "/dashboard/goals" },
      ]
    },
    {
      type: "collapsible",
      key: "servicios",
      title: "Servicios y Presupuestos",
      icon: SettingsOutlinedIcon,
      items: [
        { name: "Servicios", icon: LayersOutlinedIcon, path: "/dashboard/categories" },
        { name: "Presupuestos", icon: ReceiptOutlinedIcon, path: "/dashboard/budgets" },
      ]
    },
    {
      type: "collapsible",
      key: "ia",
      title: "IA Financiera",
      icon: AccountBalanceOutlinedIcon,
      items: [
        { name: "Asistente IA", icon: SmartToyOutlinedIcon, path: "/dashboard/ai-assistant" },
        { name: "Planificador IA", icon: BoltOutlinedIcon, path: "/dashboard/ai-planner" },
        { name: "Simulador de Futuro", icon: AutoGraphOutlinedIcon, path: "/dashboard/future-self" },
        { name: "Predicciones", icon: PsychologyOutlinedIcon, path: "/dashboard/predictions" },
        { name: "Análisis Profundo", icon: AnalyticsOutlinedIcon, path: "/dashboard/analysis" },
        { name: "DeepFinance™", icon: PsychologyOutlinedIcon, path: "/dashboard/deepfinance" },
        { name: "Alertas", icon: NotificationsOutlinedIcon, path: "/dashboard/alerts" },
      ]
    },
    {
      type: "collapsible",
      key: "familia",
      title: "Centro Familiar",
      icon: HomeOutlinedIcon,
      items: [
        { name: "Mi Familia", icon: PeopleOutlinedIcon, path: "/dashboard/family", requiresFamilyPlan: true },
        { name: "Gastos Compartidos", icon: ShareOutlinedIcon, path: "/dashboard/shared", requiresFamilyPlan: true },
        { name: "Deudas", icon: SwapHorizIcon, path: "/dashboard/debts", requiresFamilyPlan: true },
      ]
    },
    {
      title: "Herramientas",
      items: [
        { name: "Exportar Datos", icon: FileDownloadOutlinedIcon, path: "/dashboard/export" },
        { name: "Centro de Ayuda", icon: HelpOutlineIcon, path: "/dashboard/support" },
      ]
    }
  ];

  // Agregar sección de administración solo si es staff
  if (!checkingStaff && isStaff) {
    menuStructure.push({
      title: "Administración",
      items: [
        { name: "Dashboard Analytics", icon: BarChartOutlinedIcon, path: "/dashboard/admin" },
        { name: "Panel de Soporte", icon: ShieldOutlinedIcon, path: "/dashboard/admin/support" },
        { name: "Webhook Inbox", icon: InboxOutlinedIcon, path: "/dashboard/admin/webhooks" },
        { name: "Notificaciones", icon: NotificationsOutlinedIcon, path: "/dashboard/admin/system-notifications" },
      ]
    });
  }

  const sidebarWidth = isCollapsed ? 64 : 280;

  return (
    <ThemeProvider theme={appTheme === 'dark' ? darkTheme : lightTheme}>
      <CssBaseline />
      {/* Mobile Overlay */}
      {isMobile && isMobileOpen && (
        <Box
          sx={{
            position: 'fixed',
            inset: 0,
            bgcolor: 'rgba(0, 0, 0, 0.2)',
            backdropFilter: 'blur(4px)',
            zIndex: 40,
          }}
          onClick={() => setIsMobileOpen(false)}
        />
      )}

      {/* Sidebar Drawer */}
      <Drawer
        variant={isMobile ? 'temporary' : 'permanent'}
        open={isMobile ? isMobileOpen : true}
        onClose={() => setIsMobileOpen(false)}
        sx={{
          width: sidebarWidth,
          flexShrink: 0,
          '& .MuiDrawer-paper': {
            width: sidebarWidth,
            boxSizing: 'border-box',
            backgroundColor: appTheme === 'dark' ? '#1C2536' : '#FFFFFF',
            borderRight: `1px solid ${appTheme === 'dark' ? '#2A3F5F' : '#ECEFF1'}`,
            transition: 'width 0.3s ease-in-out',
            overflowX: 'hidden',
          },
        }}
      >
        {/* Header Logo + Collapse Button */}
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: isCollapsed ? 'center' : 'space-between',
            padding: '16px 12px',
            borderBottom: `1px solid ${appTheme === 'dark' ? '#2A3F5F' : '#ECEFF1'}`,
            height: 64,
          }}
        >
          {!isCollapsed && (
            <Box
              component="a"
              href="/dashboard"
              onClick={(e) => {
                e.preventDefault();
                navigate('/dashboard');
                setIsMobileOpen(false);
              }}
              sx={{
                display: 'flex',
                alignItems: 'center',
                gap: 1,
                textDecoration: 'none',
                cursor: 'pointer',
                '&:hover': { opacity: 0.8 },
              }}
            >
              <Box
                sx={{
                  width: 32,
                  height: 32,
                  background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                  borderRadius: '8px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: 'white',
                  fontWeight: 'bold',
                  fontSize: '16px',
                }}
              >
                F
              </Box>
              <Typography
                variant="h6"
                sx={{
                  fontWeight: 700,
                  fontSize: '16px',
                  letterSpacing: '-0.5px',
                  color: appTheme === 'dark' ? '#FFFFFF' : '#2C3E50',
                }}
              >
                FINANTEL
              </Typography>
            </Box>
          )}

          <IconButton
            size="small"
            onClick={() => setIsCollapsed(prev => !prev)}
            sx={{
              color: appTheme === 'dark' ? '#00A9FF' : '#2196F3',
            }}
          >
            <MenuOutlined fontSize="small" />
          </IconButton>
        </Box>

        {/* Scrollable Menu */}
        <Box
          sx={{
            flex: 1,
            overflowY: 'auto',
            overflowX: 'hidden',
            py: 2,
            px: 1,
            '&::-webkit-scrollbar': { display: 'none' },
            msOverflowStyle: 'none',
            scrollbarWidth: 'none',
          }}
        >
          <List sx={{ padding: 0 }}>
            {menuStructure.map((section, idx) => {
              if (section.type === 'collapsible') {
                return (
                  <React.Fragment key={idx}>
                    <SidebarMenuItemExpandable
                      icon={<section.icon />}
                      label={section.title}
                      isCollapsed={isCollapsed}
                      isExpanded={expandedMenus[section.key] || false}
                      onToggle={() => handleMenuToggle(section.key)}
                      submenu={section.items.map(item => ({
                        icon: <item.icon />,
                        label: item.name,
                        path: item.path,
                        isActive: currentPath === item.path,
                        onClick: () => {
                          if (item.requiresFamilyPlan && !hasFamilyPlan) {
                            handleBlockedClick(new Event('click'));
                          } else {
                            navigate(item.path);
                            setIsMobileOpen(false);
                          }
                        },
                      }))}
                    />
                  </React.Fragment>
                );
              }

              return (
                <React.Fragment key={idx}>
                  <SidebarSection title={section.title} isCollapsed={isCollapsed}>
                    {section.items.map((item) => {
                      const isActive = currentPath === item.path;
                      const isBlocked = item.requiresFamilyPlan && !hasFamilyPlan;

                      return (
                        <Box key={item.name} sx={{ position: 'relative' }}>
                          {isBlocked && (
                            <Tooltip title="Requiere Plan Familiar" arrow>
                              <IconButton
                                size="small"
                                sx={{
                                  position: 'absolute',
                                  top: -4,
                                  right: -4,
                                  zIndex: 10,
                                  color: '#F59E0B',
                                  backgroundColor: 'background.paper',
                                  width: 20,
                                  height: 20,
                                  '&:hover': { backgroundColor: 'background.paper' },
                                }}
                              >
                                <LockIcon sx={{ fontSize: 14 }} />
                              </IconButton>
                            </Tooltip>
                          )}
                          <SidebarMenuItem
                            icon={<item.icon />}
                            label={item.name}
                            path={isBlocked ? undefined : item.path}
                            isActive={isActive}
                            isCollapsed={isCollapsed}
                            onClick={() => {
                              if (isBlocked) {
                                handleBlockedClick(new Event('click'));
                              } else {
                                navigate(item.path);
                                setIsMobileOpen(false);
                              }
                            }}
                          />
                        </Box>
                      );
                    })}
                  </SidebarSection>
                  {idx < menuStructure.length - 1 && <Divider sx={{ my: 1 }} />}
                </React.Fragment>
              );
            })}
          </List>
        </Box>

        {/* Footer: User + Theme Toggle */}
        <Box
          sx={{
            padding: '16px 12px',
            borderTop: `1px solid ${appTheme === 'dark' ? '#2A3F5F' : '#ECEFF1'}`,
            backgroundColor: appTheme === 'dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.02)',
          }}
        >
          {/* User Info */}
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 1,
              padding: '8px 12px',
              borderRadius: '8px',
              backgroundColor: appTheme === 'dark' ? '#253447' : '#F5F5F5',
              marginBottom: '8px',
            }}
          >
            <Avatar
              sx={{
                width: 36,
                height: 36,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                fontSize: '14px',
                fontWeight: 'bold',
              }}
            >
              {user?.email?.charAt(0).toUpperCase() || 'U'}
            </Avatar>
            {!isCollapsed && (
              <Box sx={{ flex: 1, minWidth: 0 }}>
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: 600,
                    fontSize: '13px',
                    color: appTheme === 'dark' ? '#FFFFFF' : '#2C3E50',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email?.split('@')[0] || 'Usuario'}
                </Typography>
                <Typography
                  variant="caption"
                  sx={{
                    color: appTheme === 'dark' ? '#A0A0A0' : '#90A4AE',
                    fontSize: '11px',
                    display: 'block',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    whiteSpace: 'nowrap',
                  }}
                >
                  {user?.email || 'usuario@email.com'}
                </Typography>
              </Box>
            )}
          </Box>

          {/* Profile & Logout */}
          {!isCollapsed && (
            <>
              <SidebarMenuItem
                icon={<AccountCircleOutlinedIcon />}
                label="Mi Perfil"
                path="/dashboard/profile"
                isCollapsed={false}
                onClick={() => {
                  navigate('/dashboard/profile');
                  setIsMobileOpen(false);
                }}
              />
              <Box
                component="div"
                onClick={() => {
                  signOut();
                  setIsMobileOpen(false);
                }}
                sx={{
                  padding: '8px 12px',
                  margin: '4px 8px',
                  borderRadius: '8px',
                  cursor: 'pointer',
                  color: '#EF4444',
                  transition: 'background-color 0.3s',
                  '&:hover': {
                    backgroundColor: appTheme === 'dark' ? 'rgba(239, 68, 68, 0.1)' : 'rgba(239, 68, 68, 0.05)',
                  },
                }}
              >
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                  <LogoutOutlinedIcon sx={{ fontSize: 20 }} />
                  <Typography sx={{ fontSize: '14px', fontWeight: 500 }}>Cerrar Sesión</Typography>
                </Box>
              </Box>
            </>
          )}

          {/* Theme Toggle */}
          {!isCollapsed && (
            <IconButton
              size="small"
              onClick={toggleTheme}
              sx={{
                color: appTheme === 'dark' ? '#00A9FF' : '#2196F3',
                display: 'flex',
                gap: 1,
                justifyContent: 'center',
                width: '100%',
                mt: 1,
                padding: '8px 12px',
                borderRadius: '8px',
                '&:hover': {
                  backgroundColor: appTheme === 'dark' ? '#253447' : '#F5F5F5',
                },
              }}
            >
              {appTheme === 'dark' ? <LightModeOutlined /> : <DarkModeOutlined />}
              <Typography variant="caption" sx={{ fontSize: '12px' }}>
                {appTheme === 'dark' ? 'Claro' : 'Oscuro'}
              </Typography>
            </IconButton>
          )}
        </Box>
      </Drawer>
    </ThemeProvider>
  );
};

export default SidebarMUI;

