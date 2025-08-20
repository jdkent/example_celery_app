// Checkout.test.tsx
import React from 'react';
import { render, screen } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import Checkout from './Checkout';

const queryClient = new QueryClient();

function renderWithQueryClient(ui: React.ReactElement) {
  return render(
    <QueryClientProvider client={queryClient}>
      {ui}
    </QueryClientProvider>
  );
}

jest.mock('../services/books', () => ({
  fetchBooks: jest.fn().mockResolvedValue([]),
  checkoutBook: jest.fn(),
  returnBook: jest.fn(),
}));
jest.mock('../services/holders', () => ({
  fetchHolders: jest.fn().mockResolvedValue([]),
}));

describe('Checkout', () => {
  it('renders Checkout page title', () => {
    renderWithQueryClient(<Checkout />);
    // There are multiple "Checkout" elements (title and button)
    expect(screen.getAllByText('Checkout').length).toBeGreaterThan(1);
  });

  it('renders checkout form controls', () => {
    renderWithQueryClient(<Checkout />);
    expect(screen.getByLabelText('Book')).toBeInTheDocument();
    expect(screen.getByLabelText('Holder')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Checkout/i })).toBeInTheDocument();
  });

  it('shows message when no books are checked out', () => {
    renderWithQueryClient(<Checkout />);
    expect(screen.getByText('No books are currently checked out.')).toBeInTheDocument();
  });

  it('shows message when all books are checked out', () => {
    renderWithQueryClient(<Checkout />);
    expect(screen.getByText('All books are checked out.')).toBeInTheDocument();
  });
});
