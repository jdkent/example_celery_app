// Holders.tsx
import React, { useState } from "react";
import {
  Box,
  Button,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  Paper,
  Snackbar,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  Typography,
  CircularProgress,
  Alert,
} from "@mui/material";
import { Add, Delete } from "@mui/icons-material";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  fetchHolders,
  addHolder,
  removeHolder,
  Holder,
  HolderInput,
} from "../services/holders";

const Holders: React.FC = () => {
  const queryClient = useQueryClient();

  // State for add holder dialog
  const [openAdd, setOpenAdd] = useState(false);
  const [addData, setAddData] = useState<HolderInput>({ name: "" });
  const [addError, setAddError] = useState<{ name?: string }>({});
  const [addLoading, setAddLoading] = useState(false);

  // State for remove holder dialog
  const [removeId, setRemoveId] = useState<number | null>(null);
  const [removeLoading, setRemoveLoading] = useState(false);

  // Snackbar state
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: "success" | "error" }>({ open: false, message: "", severity: "success" });

  // Fetch holders
  const { data: holders, isLoading, isError } = useQuery({
    queryKey: ["holders"],
    queryFn: fetchHolders,
  });

  // Add holder mutation
  const addMutation = useMutation({
    mutationFn: addHolder,
    onMutate: () => setAddLoading(true),
    onSuccess: () => {
      setSnackbar({ open: true, message: "Holder added successfully", severity: "success" });
      setOpenAdd(false);
      setAddData({ name: "" });
      setAddError({});
      queryClient.invalidateQueries({ queryKey: ["holders"] });
    },
    onError: (error: any) => {
      setSnackbar({ open: true, message: error?.response?.data?.detail || "Failed to add holder", severity: "error" });
    },
    onSettled: () => setAddLoading(false),
  });

  // Remove holder mutation
  const removeMutation = useMutation({
    mutationFn: removeHolder,
    onMutate: () => setRemoveLoading(true),
    onSuccess: () => {
      setSnackbar({ open: true, message: "Holder removed", severity: "success" });
      setRemoveId(null);
      queryClient.invalidateQueries("holders");
    },
    onError: () => {
      setSnackbar({ open: true, message: "Failed to remove holder", severity: "error" });
    },
    onSettled: () => setRemoveLoading(false),
  });

  // Validation for add form
  const validateAdd = () => {
    const errors: { name?: string } = {};
    if (!addData.name.trim()) errors.name = "Name is required";
    setAddError(errors);
    return Object.keys(errors).length === 0;
  };

  // Handlers
  const handleAddOpen = () => {
    setAddData({ name: "" });
    setAddError({});
    setOpenAdd(true);
  };

  const handleAddSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateAdd()) return;
    addMutation.mutate(addData);
  };

  return (
    <Box sx={{ p: 2 }}>
      <Box sx={{ display: "flex", justifyContent: "space-between", alignItems: "center", mb: 2 }}>
        <Typography variant="h5">Holders</Typography>
        <Button variant="contained" startIcon={<Add />} onClick={handleAddOpen}>
          Add Holder
        </Button>
      </Box>
      {isLoading ? (
        <Box sx={{ display: "flex", justifyContent: "center", mt: 4 }}>
          <CircularProgress />
        </Box>
      ) : isError ? (
        <Alert severity="error">Failed to load holders.</Alert>
      ) : (
        <TableContainer component={Paper}>
          <Table size="small" aria-label="holders table">
            <TableHead>
              <TableRow>
                <TableCell>Name</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {Array.isArray(holders) && holders.length > 0 ? (
                holders.map((holder) => (
                  <TableRow key={holder.id}>
                    <TableCell>{holder.name}</TableCell>
                    <TableCell align="right">
                      <IconButton
                        aria-label="remove"
                        color="error"
                        onClick={() => setRemoveId(holder.id)}
                        disabled={removeLoading}
                      >
                        <Delete />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={2} align="center">
                    No holders found.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>
      )}

      {/* Add Holder Dialog */}
      <Dialog open={openAdd} onClose={() => setOpenAdd(false)} fullWidth maxWidth="sm">
        <DialogTitle>Add Holder</DialogTitle>
        <DialogContent>
          <form onSubmit={handleAddSubmit} id="add-holder-form">
            <TextField
              margin="normal"
              label="Name"
              fullWidth
              value={addData.name}
              onChange={(e) => setAddData({ ...addData, name: e.target.value })}
              error={!!addError.name}
              helperText={addError.name}
              disabled={addLoading}
              autoFocus
            />
          </form>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenAdd(false)} disabled={addLoading}>
            Cancel
          </Button>
          <Button
            type="submit"
            form="add-holder-form"
            variant="contained"
            disabled={addLoading}
          >
            {addLoading ? <CircularProgress size={24} /> : "Add"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Remove Holder Dialog */}
      <Dialog open={removeId !== null} onClose={() => setRemoveId(null)}>
        <DialogTitle>Remove Holder</DialogTitle>
        <DialogContent>
          <Typography>Are you sure you want to remove this holder?</Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setRemoveId(null)} disabled={removeLoading}>
            Cancel
          </Button>
          <Button
            onClick={() => removeId !== null && removeMutation.mutate(removeId)}
            color="error"
            variant="contained"
            disabled={removeLoading}
          >
            {removeLoading ? <CircularProgress size={24} /> : "Remove"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          sx={{ width: "100%" }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
};

export default Holders;
