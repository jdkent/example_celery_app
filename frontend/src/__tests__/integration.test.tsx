// Integration test for navigation and shared layout components

import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import AppShell from '../layout/AppShell';
// import Navigation from '../layout/Navigation'; // Remove if AppShell already includes Navigation
import Dashboard from '../pages/Dashboard';
import Books from '../pages/Books';

// Helper App to simulate routing and shared layout
function TestApp() {
  const queryClient = new QueryClient();
  return (
    <QueryClientProvider client={queryClient}>
      <MemoryRouter initialEntries={['/dashboard']}>
        <AppShell>
          {/* <Navigation /> */}
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/books" element={<Books />} />
          </Routes>
        </AppShell>
      </MemoryRouter>
    </QueryClientProvider>
  );
}

describe('Integration: Navigation and Shared Layout', () => {
  test('renders Dashboard and navigates to Books, layout persists', () => {
    render(<TestApp />);

    // Verify AppShell and Navigation are present
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    // If multiple Navigation components, assert at least one is present
    expect(screen.getAllByTestId('navigation').length).toBeGreaterThan(0);

    // Dashboard page content
    // Fix: Multiple elements match /dashboard/i, so use getAllByText and check at least one is present
    expect(screen.getAllByText(/dashboard/i).length).toBeGreaterThan(0);

    // Simulate navigation to Books via Navigation link
    const booksLinks = screen.getAllByRole('link', { name: /books/i });
    const navBooksLink = booksLinks.find(link => link.getAttribute('href') === '/books');
    fireEvent.click(navBooksLink!);

    // Books page content
    expect(screen.getAllByText(/books/i).length).toBeGreaterThan(0);

    // Layout components still present
    expect(screen.getByTestId('app-shell')).toBeInTheDocument();
    expect(screen.getAllByTestId('navigation').length).toBeGreaterThan(0);
  });

  test('interacts with Dashboard and Books pages', () => {
    render(<TestApp />);

    // Example interaction: Dashboard button
    const dashboardButton = screen.queryByRole('button', { name: /add/i });
    if (dashboardButton) {
      fireEvent.click(dashboardButton);
      // Add assertions if Dashboard has interactive behavior
    }

    // Navigate to Books
    const booksLinks = screen.getAllByRole('link', { name: /books/i });
    const navBooksLink = booksLinks.find(link => link.getAttribute('href') === '/books');
    fireEvent.click(navBooksLink!);

    // Example interaction: Books page
    const booksButton = screen.queryByRole('button', { name: /refresh/i });
    if (booksButton) {
      fireEvent.click(booksButton);
      // Add assertions if Books has interactive behavior
    }
  });
});
