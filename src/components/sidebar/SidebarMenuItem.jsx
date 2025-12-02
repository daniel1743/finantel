// =====================================================
// SIDEBAR MENU ITEM - AdminMart Style
// =====================================================
// Componente para items del menú del sidebar
// =====================================================

import React from 'react';
import { ListItem, ListItemIcon, ListItemText, Chip } from '@mui/material';
import { Link } from 'react-router-dom';

const SidebarMenuItem = ({
  icon,
  label,
  path,
  isActive = false,
  badge = null,
  isCollapsed,
  onClick,
  sx,
}) => {
  const content = (
    <ListItem
      component={path ? Link : 'div'}
      to={path}
      onClick={onClick}
      sx={(theme) => ({
        padding: '8px 12px',
        margin: '4px 8px',
        borderRadius: '8px',
        backgroundColor: isActive ? theme.palette.action.selected : 'transparent',
        borderLeft: isActive ? `3px solid ${theme.palette.primary.main}` : 'none',
        paddingLeft: isActive ? '9px' : '12px',
        cursor: 'pointer',
        textDecoration: 'none',
        transition: theme.transitions.create(['background-color', 'border-color'], {
          duration: theme.transitions.duration.short,
        }),
        '&:hover': {
          backgroundColor: theme.palette.action.hover,
        },
        ...sx,
      })}
    >
      <ListItemIcon
        sx={(theme) => ({
          minWidth: 40,
          color: isActive ? theme.palette.primary.main : theme.palette.text.secondary,
        })}
      >
        {icon}
      </ListItemIcon>

      {!isCollapsed && (
        <ListItemText
          primary={label}
          primaryTypographyProps={{
            sx: (theme) => ({
              fontSize: '14px',
              fontWeight: isActive ? 600 : 500,
              color: theme.palette.text.primary,
            }),
          }}
        />
      )}

      {badge && !isCollapsed && (
        <Chip
          label={badge}
          size="small"
          sx={(theme) => ({
            marginLeft: 'auto',
            backgroundColor: theme.palette.primary.main,
            color: 'white',
            height: '20px',
            fontSize: '11px',
            fontWeight: 600,
          })}
        />
      )}
    </ListItem>
  );

  return content;
};

export default SidebarMenuItem;

