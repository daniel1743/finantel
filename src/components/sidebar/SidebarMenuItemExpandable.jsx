// =====================================================
// SIDEBAR MENU ITEM EXPANDABLE - AdminMart Style
// =====================================================
// Componente para items expandables del sidebar
// =====================================================

import React from 'react';
import {
  ListItem,
  ListItemIcon,
  ListItemText,
  Collapse,
  List,
  Box,
} from '@mui/material';
import ExpandLess from '@mui/icons-material/ExpandLess';
import ExpandMore from '@mui/icons-material/ExpandMore';
import SidebarMenuItem from './SidebarMenuItem';

const SidebarMenuItemExpandable = ({
  icon,
  label,
  isCollapsed,
  isExpanded,
  onToggle,
  submenu = [],
}) => {
  return (
    <>
      <ListItem
        onClick={onToggle}
        sx={(theme) => ({
          padding: '8px 12px',
          margin: '4px 8px',
          borderRadius: '8px',
          cursor: 'pointer',
          transition: theme.transitions.create('background-color', {
            duration: theme.transitions.duration.short,
          }),
          '&:hover': {
            backgroundColor: theme.palette.action.hover,
          },
        })}
      >
        <ListItemIcon sx={{ minWidth: 40, color: 'text.secondary' }}>
          {icon}
        </ListItemIcon>

        {!isCollapsed && (
          <>
            <ListItemText
              primary={label}
              primaryTypographyProps={{
                sx: { fontSize: '14px', fontWeight: 500 },
              }}
            />
            {isExpanded ? <ExpandLess /> : <ExpandMore />}
          </>
        )}
      </ListItem>

      <Collapse in={isExpanded && !isCollapsed} timeout="auto" unmountOnExit>
        <List component="div" disablePadding>
          {submenu.map((item, index) => (
            <Box key={index} sx={{ pl: 3 }}>
              <SidebarMenuItem
                icon={item.icon}
                label={item.label}
                path={item.path}
                isActive={item.isActive}
                isCollapsed={false}
                onClick={item.onClick}
              />
            </Box>
          ))}
        </List>
      </Collapse>
    </>
  );
};

export default SidebarMenuItemExpandable;

