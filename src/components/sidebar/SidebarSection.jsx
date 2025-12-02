// =====================================================
// SIDEBAR SECTION - AdminMart Style
// =====================================================
// Componente para secciones del sidebar con título
// =====================================================

import React from 'react';
import { Typography } from '@mui/material';

const SidebarSection = ({ title, isCollapsed, children }) => {
  if (isCollapsed) return <>{children}</>;

  return (
    <>
      <Typography
        variant="h6"
        sx={{
          fontSize: '11px',
          fontWeight: 600,
          letterSpacing: '0.5px',
          textTransform: 'uppercase',
          color: 'text.secondary',
          padding: '16px 20px 8px 20px',
          marginTop: '8px',
        }}
      >
        {title}
      </Typography>
      {children}
    </>
  );
};

export default SidebarSection;

