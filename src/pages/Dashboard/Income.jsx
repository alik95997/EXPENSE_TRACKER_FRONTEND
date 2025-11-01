import React, { useState, useEffect } from "react";
import {
  Box,
  Typography,
  Button,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Stack,
  Card,
  CardContent,
  List,
  ListItem,
  Divider,
  CircularProgress,
  IconButton,
  Alert, // Imported Alert for form validation message display
} from "@mui/material";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
} from "recharts";
import AddIcon from "@mui/icons-material/Add";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
// Assuming ResponsiveDrawer and other components are available globally for this single-file setup
// Since the path is relative ("../../components/layouts/HomeLayout"), we will assume it's part of the environment
// and focus on the main component logic.
const ResponsiveDrawer = ({ children }) => <Box>{children}</Box>; 

// --- Helper Component for Statistics Card ---
const StatisticCard = ({ title, amount, icon, iconColor }) => {
  const formattedAmount = `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;
  return (
    <Card sx={{ borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          {React.cloneElement(icon, {
            color: iconColor,
            sx: { fontSize: 30, mr: 1.5 },
          })}
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ fontWeight: 600 }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: iconColor === "success" ? "success.main" : "primary.main",
          }}
        >
          {formattedAmount}
        </Typography>
      </CardContent>
    </Card>
  );
};

// --- Format data for BarChart (kept for future chart rendering) ---
const processBarChartData = (transactions) => {
  const last30Days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 30; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10);
    last30Days.push({
      date: dateKey,
      dayName: date.toLocaleDateString("en-US", { weekday: "short" }),
      income: 0,
    });
  }

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date).toISOString().slice(0, 10);
    const dayData = last30Days.find((d) => d.date === txDate);
    if (dayData) {
      dayData.income += parseFloat(tx.amount) || 0;
    }
  });

  return last30Days;
};

// --- Main Income Component ---
const Income = () => {
  // Variable conflict avoidance: Get token inside the component scope.
  const userToken = localStorage.getItem("token");

  // State for Add Income Dialog and its loading/errors
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [inputError, setInputError] = useState(""); // Custom error message state

  // State for Delete Confirmation Dialog (Replaces window.confirm)
  const [deleteConfirmation, setDeleteConfirmation] = useState({
    isOpen: false,
    txId: null,
  });

  // Data fetching states
  const [transactions, setTransactions] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [summary, setSummary] = useState({
    balance: 0,
    totalIncome: 0,
    last30DaysIncome: 0,
  });
  const [incomeData, setIncomeData] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const [chartData, setChartData] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleChange = (e) => {
    setIncomeData({ ...incomeData, [e.target.name]: e.target.value });
    // Clear error message on input change
    if (inputError) setInputError(""); 
  };

  const calculateSummary = (data) => {
    let total = 0;
    let last30Days = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    data.forEach((tx) => {
      const amount = parseFloat(tx.amount) || 0;
      const txDate = new Date(tx.date);
      total += amount;
      if (txDate >= thirtyDaysAgo) last30Days += amount;
    });

    setSummary({
      totalIncome: total,
      last30DaysIncome: last30Days,
      balance: total,
    });
  };

  // --- Fetch income ---
  const fetchIncome = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://expense-tracker-backend-chi-six.vercel.app/api/income/getincome",
        {
          headers: {
            // Using the locally scoped userToken
            Authorization: `Bearer ${userToken}`,
          },
        }
      );

      const result = await response.json();
      if (response.ok) {
        const data = result.data || [];
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(data);
        calculateSummary(data);
        setChartData(processBarChartData(data));
      } else {
        console.error(result.message);
      }
    } catch (error) {
      console.error("Error fetching income:", error);
    } finally {
      setIsLoading(false);
    }
  };

  // --- Add Income ---
  const submitIncome = async () => {
    // Replaced alert() with inputError state
    if (!incomeData.category || !incomeData.amount || parseFloat(incomeData.amount) <= 0) {
      setInputError("Please enter a category and a valid amount greater than zero.");
      return;
    }

    setInputError(""); // Clear any previous error
    setLoading(true);
    try {
      const response = await fetch(
        "https://expense-tracker-backend-chi-six.vercel.app/api/income/addincome",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            // Using the locally scoped userToken
            Authorization: `Bearer ${userToken}`,
          },
          body: JSON.stringify(incomeData),
        }
      );

      const result = await response.json();
      if (response.ok) {
        setOpen(false);
        setIncomeData({
          category: "",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setRefreshKey((prev) => prev + 1);
      } else {
        // Handle server-side errors with inputError state
        setInputError(result.message || "Failed to add income record. Please try again.");
      }
    } catch (error) {
      console.error("Error adding income:", error);
      setInputError("Network error or failed to connect to the server.");
    } finally {
      setLoading(false);
    }
  };
  
  // Handler to open the custom delete confirmation dialog
  const handleDeleteClick = (id) => {
    setDeleteConfirmation({ isOpen: true, txId: id });
  };

  // --- Delete Income (executed after confirmation) ---
  const handleDelete = async () => {
    if (!deleteConfirmation.txId) return;

    const id = deleteConfirmation.txId;
    
    // Close the dialog and reset state immediately
    setDeleteConfirmation({ isOpen: false, txId: null });

    try {
      const response = await fetch(
        // The original logic uses ID in the URL, which is correct for a DELETE
        `https://expense-tracker-backend-chi-six.vercel.app/api/income/deleteincome/${id}`,
        {
          method: "DELETE",
          headers: {
            // Using the locally scoped userToken
            Authorization: `Bearer ${userToken}`,
          },
        }
      );
      if (response.ok) {
        setRefreshKey((prev) => prev + 1);
      } else {
        // Log delete failure if needed
        console.error("Delete failed:", await response.json());
      }
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [refreshKey]);


  // --- Custom Confirmation Dialog Component (Replaces window.confirm) ---
  const ConfirmationDialog = () => (
    <Dialog
      open={deleteConfirmation.isOpen}
      onClose={() => setDeleteConfirmation({ isOpen: false, txId: null })}
      aria-labelledby="delete-confirmation-title"
    >
      <DialogTitle id="delete-confirmation-title">Confirm Deletion</DialogTitle>
      <DialogContent>
        <Typography>
          Are you sure you want to permanently delete this income record? This action cannot be undone.
        </Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={() => setDeleteConfirmation({ isOpen: false, txId: null })} color="primary">
          Cancel
        </Button>
        <Button onClick={handleDelete} color="error" variant="contained" autoFocus>
          Delete
        </Button>
      </DialogActions>
    </Dialog>
  );

  return (
    <ResponsiveDrawer>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: "flex", justifyContent: "space-between", mb: 3 }}>
          <Typography variant="h4" fontWeight={700}>
            Income Dashboard
          </Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => {
              setOpen(true);
              setInputError(""); // Clear error on opening dialog
            }}
          >
            Add New Income
          </Button>
        </Box>

        {/* Statistic Cards */}
        <Box sx={{ display: "grid", gap: 3, gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))" }}>
          <StatisticCard
            title="Current Balance"
            amount={summary.balance}
            icon={<AccountBalanceWalletIcon />}
            iconColor="primary"
          />
          <StatisticCard
            title="Total Income"
            amount={summary.totalIncome}
            icon={<MonetizationOnIcon />}
            iconColor="success"
          />
          <StatisticCard
            title="Last 30 Days"
            amount={summary.last30DaysIncome}
            icon={<ArrowUpwardIcon />}
            iconColor="info"
          />
        </Box>

        {/* Transactions List */}
        <Card sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" fontWeight={700} sx={{ mb: 2 }}>
            Recent Transactions
          </Typography>
          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CircularProgress />
              <Typography>Loading data...</Typography>
            </Box>
          ) : transactions.length === 0 ? (
            <Typography sx={{ textAlign: "center", py: 3, color: 'text.secondary' }}>
              No income records found. Click "Add New Income" to get started!
            </Typography>
          ) : (
            <List>
              {transactions.map((tx) => (
                <React.Fragment key={tx._id}>
                  <ListItem
                    secondaryAction={
                      // Use the new handler to open the custom confirmation dialog
                      <IconButton color="error" onClick={() => handleDeleteClick(tx._id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight={600}>{tx.category}</Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(tx.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography fontWeight={600} color="success.main">
                      +${parseFloat(tx.amount).toFixed(2)}
                    </Typography>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>

        {/* Add New Income Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add New Income</DialogTitle>
          <DialogContent>
            <Stack spacing={2} sx={{ pt: 1 }}>
              {/* Display custom error message instead of alert() */}
              {inputError && (
                <Alert severity="error" onClose={() => setInputError("")}>
                  {inputError}
                </Alert>
              )}
              <TextField
                label="Category (e.g., Salary, Freelance)"
                name="category"
                value={incomeData.category}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={incomeData.amount}
                onChange={handleChange}
                fullWidth
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={incomeData.date}
                onChange={handleChange}
                fullWidth
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)} disabled={loading}>Cancel</Button>
            <Button onClick={submitIncome} variant="contained" color="success" disabled={loading}>
              {loading ? <CircularProgress size={24} color="inherit" /> : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
        
        {/* Custom Delete Confirmation Dialog */}
        <ConfirmationDialog />
      </Box>
    </ResponsiveDrawer>
  );
};

export default Income;
