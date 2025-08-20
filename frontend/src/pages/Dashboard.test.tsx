// Dashboard.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import Dashboard from './Dashboard';

describe('Dashboard', () => {
  it('renders Dashboard page placeholder', () => {
    render(<Dashboard />);
    expect(screen.getByText('Dashboard Page (placeholder)')).toBeInTheDocument();
  });
});
