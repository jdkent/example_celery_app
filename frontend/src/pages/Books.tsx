// frontend/src/pages/Books.tsx
import React, { useState } from 'react';
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  TextField,
  Snackbar,
  Alert,
  CircularProgress,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  IconButton,
} from '@mui/material';
import DeleteIcon from '@mui/icons-material/Delete';
import AddIcon from '@mui/icons-material/Add';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  fetchBooks,
  addBook,
  removeBook,
  Book,
  BookInput,
} from '../services/books';
import { fetchHolders, Holder } from '../services/holders';

const Books: React.FC = () => {
    const queryClient = useQueryClient();
    const [libraryId, setLibraryId] = useState<number | null>(null);

    // Fetch holders and set libraryId
    React.useEffect(() => {
      fetchHolders().then(holders => {
        const library = holders.find((h: Holder) => h.name.toLowerCase() === 'library');
        if (library) setLibraryId(library.id);
      });
    }, []);

  // State for add modal
  const [openAdd, setOpenAdd] = useState(false);
  const [addData, setAddData] = useState<BookInput>({
    title: '',
    author: '',
    published_year: new Date().getFullYear(),
  });
  const [addError, setAddError] = useState<{ [key: string]: string }>({});
  const [addLoading, setAddLoading] = useState(false);

  // State for remove dialog
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: 'success' | 'error';
  }>({ open: false, message: '', severity: 'success' });

  // Fetch books
  const {
    data: books,
    isLoading,
    isError,
    error,
  } = useQuery<Book[], Error>({
    queryKey: ['books'],
    queryFn: fetchBooks,
  });

  // Add book mutation
  const addBookMutation = useMutation({
    mutationFn: addBook,
    onMutate: () => setAddLoading(true),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Book added!', severity: 'success' });
      setOpenAdd(false);
      setAddData({ title: '', author: '', published_year: new Date().getFullYear() });
      setAddError({});
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: err?.response?.data?.detail || 'Failed to add book', severity: 'error' });
    },
    onSettled: () => setAddLoading(false),
  });

  // Remove book mutation
  const removeBookMutation = useMutation({
    mutationFn: removeBook,
    onMutate: () => setRemoveLoading(true),
    onSuccess: () => {
      setSnackbar({ open: true, message: 'Book removed!', severity: 'success' });
      setRemoveId(null);
      queryClient.invalidateQueries({ queryKey: ['books'] });
    },
    onError: (err: any) => {
      setSnackbar({ open: true, message: err?.response?.data?.detail || 'Failed to remove book', severity: 'error' });
    },
    onSettled: () => setRemoveLoading(false),
  });

  // Add book form validation
  const validateAdd = () => {
    const errors: { [key: string]: string } = {};
    if (!addData.title.trim()) errors.title = 'Title is required';
    if (!addData.author.trim()) errors.author = 'Author is required';
    if (!addData.published_year || isNaN(addData.published_year)) errors.published_year = 'Year is required';
    return errors;
  };

  // Handlers
  const handleAddOpen = () => {
    setAddData({ title: '', author: '', published_year: new Date().getFullYear() });
    setAddError({});
    setOpenAdd(true);
  };

  const handleAddChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setAddData({ ...addData, [e.target.name]: e.target.value });
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const errors = validateAdd();
    if (Object.keys(errors).length) {
      setAddError(errors);
      return;
    }
    if (libraryId !== null) {
      addBookMutation.mutate({
        ...addData,
        published_year: Number(addData.published_year),
        holder_id: libraryId,
      });
    } else {
      setSnackbar({ open: true, message: 'Library holder not found', severity: 'error' });
    }
  };

  const handleRemove = (id: number) => setRemoveId(id);

  const handleRemoveConfirm = () => {
    if (removeId !== null) removeBookMutation.mutate(removeId);
  };

  const handleSnackbarClose = () => setSnackbar({ ...snackbar, open: false });

  // Responsive table/grid
  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h4">Books</Typography>
        <Button variant="contained" startIcon={<AddIcon />} onClick={handleAddOpen}>
          Add Book
        </Button>
      </Box>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">{(error as Error)?.message || 'Failed to load books'}</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small" aria-label="books table">
            <TableHead>
              <TableRow>
                <TableCell>Title</TableCell>
                <TableCell>Author</TableCell>
                <TableCell>Year</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(books) && books.length > 0 ? (
                books.map((book) => (
                  <TableRow key={book.id}>
                    <TableCell>{book.title}</TableCell>
                    <TableCell>{book.author}</TableCell>
                    <TableCell>{book.published_year}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="delete"
                        color="error"
                        onClick={() => handleRemove(book.id)}
                        disabled={removeLoading}
                      >
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={4} align="center">
                    No books found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Book Modal */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add New Book</DialogTitle>
        <form onSubmit={handleAddSubmit}>
          <DialogContent>
            <TextField
              margin="dense"
              label="Title"
              name="title"
              fullWidth
              value={addData.title}
              onChange={handleAddChange}
              error={!!addError.title}
              helperText={addError.title}
              disabled={addLoading}
              required
            />
            <TextField
              margin="dense"
              label="Author"
              name="author"
              fullWidth
              value={addData.author}
              onChange={handleAddChange}
              error={!!addError.author}
              helperText={addError.author}
              disabled={addLoading}
              required
            />
            <TextField
              margin="dense"
              label="Published Year"
              name="published_year"
              type="number"
              fullWidth
              value={addData.published_year}
              onChange={handleAddChange}
              error={!!addError.published_year}
              helperText={addError.published_year}
              disabled={addLoading}
              required
              inputProps={{ min: 0, max: new Date().getFullYear() }}
            />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenAdd(false)} disabled={addLoading}>
              Cancel
            </Button>
            <Button type="submit" variant="contained" disabled={addLoading}>
              {addLoading ? <CircularProgress size={20} /> : 'Add'}
            </Button>
          </DialogActions>
        </form>
      </Dialog>

      {/* Remove Confirmation Dialog */}
      <Dialog open={removeId !== null} onClose={() => setRemoveId(null)}>
        <DialogTitle>Remove Book</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this book?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveId(null)} disabled={removeLoading}>
            Cancel
          </Button>
          <Button
            onClick={handleRemoveConfirm}
            color="error"
            variant="contained"
            disabled={removeLoading}
          >
            {removeLoading ? <CircularProgress size={20} /> : 'Remove'}
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
    </Box>
  );
};

export default Books;
