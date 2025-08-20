// AppShell.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import AppShell from './AppShell';

describe('AppShell', () => {
  it('renders without crashing', () => {
    render(
      <MemoryRouter>
        <AppShell><div>Test Content</div></AppShell>
      </MemoryRouter>
    );
    expect(screen.getByText('Test Content')).toBeInTheDocument();
  });

  it('renders Navigation component', () => {
    render(
      <MemoryRouter>
        <AppShell><div /></AppShell>
      </MemoryRouter>
    );
    // Navigation renders a nav element (assumed), adjust selector if needed
    expect(screen.getByRole('navigation')).toBeInTheDocument();
  });

  it('renders children correctly', () => {
    render(
      <MemoryRouter>
        <AppShell><span>Child Element</span></AppShell>
      </MemoryRouter>
    );
    expect(screen.getByText('Child Element')).toBeInTheDocument();
  });
});
