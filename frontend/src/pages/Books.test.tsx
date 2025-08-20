// Books.test.tsx
import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { MemoryRouter } from 'react-router-dom';
import Books from './Books';

function renderWithProviders(ui: React.ReactElement) {
  const queryClient = new QueryClient();
  return render(
    <QueryClientProvider client={queryClient}>
      <MemoryRouter>
        {ui}
      </MemoryRouter>
    </QueryClientProvider>
  );
}

jest.mock('@tanstack/react-query', () => {
  const actual = jest.requireActual('@tanstack/react-query');
  return {
    ...actual,
    useQuery: () => ({
      data: [],
      isLoading: false,
      isError: false,
      error: null,
    }),
  };
});
jest.mock('../services/books', () => ({
  fetchBooks: jest.fn().mockResolvedValue([]),
  addBook: jest.fn(),
  removeBook: jest.fn(),
}));

describe('Books', () => {
  it('renders Books page title', () => {
    renderWithProviders(<Books />);
    expect(screen.getByText('Books')).toBeInTheDocument();
  });

  it('renders Add Book button and opens dialog', () => {
    renderWithProviders(<Books />);
    const addButton = screen.getByText('Add Book');
    expect(addButton).toBeInTheDocument();
    fireEvent.click(addButton);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByText('Add New Book')).toBeInTheDocument();
  });

  it('renders table with no books found', async () => {
    jest.mock('@tanstack/react-query', () => ({
      ...jest.requireActual('@tanstack/react-query'),
      useQuery: () => ({
        data: [],
        isLoading: false,
        isError: false,
        error: null,
      }),
    }));
    renderWithProviders(<Books />);
    expect(await screen.findByText('No books found.')).toBeInTheDocument();
    jest.unmock('@tanstack/react-query');
  });
});
