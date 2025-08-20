// Checkout.tsx
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBooks,
  checkoutBook,
  returnBook,
  Book,
} from '../services/books';
import { fetchHolders, Holder } from '../services/holders';

import {
  Box,
  Button,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogContentText,
  DialogTitle,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Snackbar,
  Typography,
  Paper,
  Grid,
  Alert,
} from '@mui/material';

const Checkout: React.FC = () => {
  const queryClient = useQueryClient();

  // State for checkout
  const [selectedBookId, setSelectedBookId] = useState<number | ''>('');
  const [selectedHolderId, setSelectedHolderId] = useState<number | ''>('');
  const [checkoutError, setCheckoutError] = useState<string | null>(null);

  // State for return dialog
  const [returnDialogOpen, setReturnDialogOpen] = useState(false);
  const [returnBookId, setReturnBookId] = useState<number | null>(null);

  // Snackbar
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: 'success' | 'error' }>({
    open: false,
    message: '',
    severity: 'success',
  });

  // Fetch books and holders
  const { data: books, isLoading: booksLoading, error: booksError } = useQuery({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });
  const { data: holders, isLoading: holdersLoading, error: holdersError } = useQuery({
    queryKey: ['holders'],
    queryFn: fetchHolders,
  });

  // Mutations
  const checkoutMutation = useMutation({
    mutationFn: ({ bookId, holderId }: { bookId: number; holderId: number }) => checkoutBook(bookId, holderId),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Book checked out successfully!', severity: 'success' });
      setSelectedBookId('');
      setSelectedHolderId('');
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error?.response?.data?.error || 'Checkout failed', severity: 'error' });
    },
  });

  const returnMutation = useMutation({
    mutationFn: (bookId: number) => returnBook(bookId),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Book returned successfully!', severity: 'success' });
      setReturnDialogOpen(false);
      setReturnBookId(null);
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
      onError: (error: any) => {
        setSnackbar({ open: true, message: error?.response?.data?.error || 'Return failed', severity: 'error' });
      },
    }
  );

  // Derived lists (updated logic: "Library" holder means available)
  const availableBooks = Array.isArray(books)
    ? books.filter((b: any) => b.holder?.name === "Library")
    : [];
  const checkedOutBooks = Array.isArray(books)
    ? books.filter((b: any) => b.holder?.name !== "Library")
    : [];

  // Handlers
  const handleCheckout = () => {
    if (!selectedBookId || !selectedHolderId) {
      setCheckoutError('Please select both a book and a holder.');
      return;
    }
    setCheckoutError(null);
    checkoutMutation.mutate({ bookId: selectedBookId as number, holderId: selectedHolderId as number });
  };

  const handleReturn = (bookId: number) => {
    setReturnBookId(bookId);
    setReturnDialogOpen(true);
  };

  const confirmReturn = () => {
    if (returnBookId !== null) {
      returnMutation.mutate(returnBookId);
    }
  };

  const handleSnackbarClose = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // UI
  return (
    <Box sx={{ p: { xs: 1, md: 3 }, maxWidth: 900, mx: 'auto' }}>
      <Typography variant="h4" gutterBottom>
        Checkout
      </Typography>

      {/* Checkout Form */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Check Out a Book
        </Typography>
        <Grid container spacing={2} alignItems="center">
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="book-select-label">Book</InputLabel>
              <Select
                labelId="book-select-label"
                value={selectedBookId}
                label="Book"
                onChange={(e) => setSelectedBookId(Number(e.target.value))}
                disabled={booksLoading || availableBooks.length === 0}
              >
                {availableBooks.map((book) => (
                  <MenuItem key={book.id} value={book.id}>
                    {book.title} by {book.author}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={5}>
            <FormControl fullWidth>
              <InputLabel id="holder-select-label">Holder</InputLabel>
              <Select
                labelId="holder-select-label"
                value={selectedHolderId}
                label="Holder"
                onChange={(e) => setSelectedHolderId(Number(e.target.value))}
                disabled={holdersLoading || !holders}
              >
                {Array.isArray(holders)
                  ? holders.map((holder) => (
                      <MenuItem key={holder.id} value={holder.id}>
                        {holder.name} ({holder.email})
                      </MenuItem>
                    ))
                  : null}
              </Select>
            </FormControl>
          </Grid>
          <Grid item xs={12} md={2}>
            <Button
              variant="contained"
              color="primary"
              onClick={handleCheckout}
              disabled={checkoutMutation.isLoading || booksLoading || holdersLoading}
              fullWidth
            >
              {checkoutMutation.isLoading ? <CircularProgress size={24} /> : 'Checkout'}
            </Button>
          </Grid>
        </Grid>
        {checkoutError && (
          <Box mt={2}>
            <Alert severity="error">{checkoutError}</Alert>
          </Box>
        )}
      </Paper>

      {/* Checked Out Books */}
      <Paper sx={{ p: 2, mb: 3 }}>
        <Typography variant="h6" gutterBottom>
          Checked Out Books
        </Typography>
        {booksLoading ? (
          <CircularProgress />
        ) : checkedOutBooks.length === 0 ? (
          <Typography>No books are currently checked out.</Typography>
        ) : (
          <Grid container spacing={2}>
            {checkedOutBooks.map((book: any) => (
              <Grid item xs={12} md={6} key={book.id}>
                <Paper sx={{ p: 2, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Box>
                    <Typography>
                      <strong>{book.title}</strong> by {book.author}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Holder: {book.holder?.name || 'Unknown'}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    color="secondary"
                    onClick={() => handleReturn(book.id)}
                    disabled={returnMutation.isLoading}
                  >
                    Return
                  </Button>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Available Books */}
      <Paper sx={{ p: 2 }}>
        <Typography variant="h6" gutterBottom>
          Available Books
        </Typography>
        {booksLoading ? (
          <CircularProgress />
        ) : availableBooks.length === 0 ? (
          <Typography>All books are checked out.</Typography>
        ) : (
          <Grid container spacing={2}>
            {availableBooks.map((book: any) => (
              <Grid item xs={12} md={6} key={book.id}>
                <Paper sx={{ p: 2 }}>
                  <Typography>
                    <strong>{book.title}</strong> by {book.author}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Published: {book.published_year}
                  </Typography>
                </Paper>
              </Grid>
            ))}
          </Grid>
        )}
      </Paper>

      {/* Return Confirmation Dialog */}
      <Dialog open={returnDialogOpen} onClose={() => setReturnDialogOpen(false)}>
        <DialogTitle>Return Book</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to return this book?
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setReturnDialogOpen(false)} color="primary">
            Cancel
          </Button>
          <Button
            onClick={confirmReturn}
            color="secondary"
            disabled={returnMutation.isLoading}
          >
            {returnMutation.isLoading ? <CircularProgress size={20} /> : 'Return'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={handleSnackbarClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={handleSnackbarClose} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>

      {/* Error handling */}
      {(booksError || holdersError) && (
        <Box mt={2}>
          <Alert severity="error">
            {booksError ? 'Failed to load books.' : ''}
            {holdersError ? 'Failed to load holders.' : ''}
          </Alert>
        </Box>
      )}
    </Box>
  );
};

export default Checkout;
