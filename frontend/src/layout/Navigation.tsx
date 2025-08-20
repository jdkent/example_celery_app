// Navigation.tsx
import React from 'react';
import { Drawer, List, ListItem, ListItemIcon, ListItemText, Toolbar, Divider } from '@mui/material';
import DashboardIcon from '@mui/icons-material/Dashboard';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import PeopleIcon from '@mui/icons-material/People';
import ShoppingCartIcon from '@mui/icons-material/ShoppingCart';
import { Link as RouterLink } from 'react-router-dom';

const drawerWidth = 220;

const navItems = [
  { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
  { text: 'Books', icon: <MenuBookIcon />, path: '/books' },
  { text: 'Holders', icon: <PeopleIcon />, path: '/holders' },
  { text: 'Checkout', icon: <ShoppingCartIcon />, path: '/checkout' },
];

const Navigation: React.FC = () => (
  <Drawer
    variant="permanent"
    sx={{
      width: drawerWidth,
      flexShrink: 0,
      [`& .MuiDrawer-paper`]: { width: drawerWidth, boxSizing: 'border-box' },
      display: { xs: 'none', sm: 'block' },
    }}
    open
  >
    <Toolbar />
    <Divider />
    <nav aria-label="main navigation" data-testid="navigation">
      <List>
        {navItems.map((item) => (
          <ListItem component={RouterLink} to={item.path} key={item.text}>
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </nav>
  </Drawer>
);

export default Navigation;
