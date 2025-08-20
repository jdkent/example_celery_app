// Holders.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Holders from './Holders';

const queryClient = new QueryClient();

function renderWithQueryClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

jest.mock('../services/holders', () => ({
  fetchHolders: jest.fn().mockResolvedValue([]),
  addHolder: jest.fn(),
  removeHolder: jest.fn(),
}));

describe('Holders', () => {
  it('renders Holders page title', () => {
    renderWithQueryClient(<Holders />);
    expect(screen.getByText('Holders')).toBeInTheDocument();
  });

  it('renders Add Holder button and opens dialog', () => {
    renderWithQueryClient(<Holders />);
    const addButton = screen.getByText('Add Holder');
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // There are multiple "Add Holder" elements (button and dialog title)
    expect(screen.getAllByText('Add Holder').length).toBeGreaterThan(1);
  });

  it('renders table with no holders found', () => {
    renderWithQueryClient(<Holders />);
    expect(screen.getByText('No holders found.')).toBeInTheDocument();
  });
});
