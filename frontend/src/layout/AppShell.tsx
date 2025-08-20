// AppShell.tsx
import React from 'react';
import { Box, Toolbar, CssBaseline, ThemeProvider, createTheme } from '@mui/material';
import Navigation from './Navigation';

const theme = createTheme();

interface AppShellProps {
  children: React.ReactNode;
}

const AppShell: React.FC<AppShellProps> = ({ children }) => (
  <ThemeProvider theme={theme}>
    <CssBaseline />
    <Box sx={{ display: 'flex', minHeight: '100vh' }} data-testid="app-shell">
      <Navigation />
      <Box component="main" sx={{ flexGrow: 1, p: 3 }}>
        <Toolbar />
        {children}
      </Box>
    </Box>
  </ThemeProvider>
);

export default AppShell;
