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
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DeleteIcon from "@mui/icons-material/Delete";
import ResponsiveDrawer from "../../components/layouts/HomeLayout";
import api from "../../utils/api";
import StatisticCard from "../../components/cards/StatisticCard";

// --- Process data for BarChart (Last 30 days) ---
const processBarChartData = (transactions) => {
  const last30Days = [];
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  for (let i = 29; i >= 0; i--) {
    const date = new Date(today);
    date.setDate(today.getDate() - i);
    const dateKey = date.toISOString().slice(0, 10);
    last30Days.push({
      date: dateKey,
      dayLabel: `${date.getMonth() + 1}/${date.getDate()}`,
      expense: 0,
    });
  }

  transactions.forEach((tx) => {
    const txDate = new Date(tx.date).toISOString().slice(0, 10);
    const dayData = last30Days.find((d) => d.date === txDate);
    if (dayData) {
      dayData.expense += parseFloat(tx.amount) || 0;
    }
  });

  return last30Days;
};

// --- Main Expense Component ---
const Expense = () => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [isLoadingTransactions, setIsLoadingTransactions] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [refreshKey, setRefreshKey] = useState(0);
  const [chartData, setChartData] = useState([]);
  const [summary, setSummary] = useState({
    totalExpense: 0.0,
    last30DaysExpense: 0.0,
  });

  const [expenseData, setExpenseData] = useState({
    category: "",
    amount: "",
    date: new Date().toISOString().slice(0, 10),
  });

  const handleClose = () => setOpen(false);

  const handleChange = (e) => {
    setExpenseData({
      ...expenseData,
      [e.target.name]: e.target.value,
    });
  };

  const calculateSummary = (fetchedTransactions) => {
    let total = 0;
    let last30Days = 0;
    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    fetchedTransactions.forEach((tx) => {
      const amount = parseFloat(tx.amount) || 0;
      const txDate = new Date(tx.date);

      total += amount;
      if (txDate >= thirtyDaysAgo) last30Days += amount;
    });

    setSummary({ totalExpense: total, last30DaysExpense: last30Days });
  };

  const fetchExpense = async () => {
    setIsLoadingTransactions(true);
    try {
      const response = await api.get("/expense/getexpense");
      const result = response.data;

      if (response.status === 200) {
        const data = result.data || [];
        data.sort((a, b) => new Date(b.date) - new Date(a.date));
        setTransactions(data);
        calculateSummary(data);
        setChartData(processBarChartData(data));
      } else {
        setTransactions([]);
        calculateSummary([]);
        setChartData([]);
        console.error("Failed to fetch expense:", result.message);
      }
    } catch (error) {
      setTransactions([]);
      calculateSummary([]);
      setChartData([]);
      console.error("Network Error:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  const submitExpense = async () => {
    if (
      !expenseData.category ||
      !expenseData.amount ||
      !expenseData.date ||
      parseFloat(expenseData.amount) <= 0
    )
      return console.error("Validation Error");

    setLoading(true);

    const payload = {
      category: expenseData.category,
      amount: parseFloat(expenseData.amount),
      date: new Date(expenseData.date).toISOString(),
    };

    try {
      const response = await api.post("/expense/addexpense", payload);
      const result = response.data;

      if (response.status === 200 || response.status === 201) {
        setRefreshKey((prev) => prev + 1);
        setExpenseData({
          category: "",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
        });
        handleClose();
      } else {
        console.error("API Error:", result.message);
      }
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Are you sure you want to delete this expense?"))
      return;

    setIsLoadingTransactions(true);
    try {
      const response = await api.delete(`/expense/deleteexpense/${id}`);
      if (response.status === 200) setRefreshKey((prev) => prev + 1);
      else console.error("Failed to delete expense");
    } catch (error) {
      console.error("Network Error:", error);
    } finally {
      setIsLoadingTransactions(false);
    }
  };

  useEffect(() => {
    fetchExpense();
  }, [refreshKey]);

  return (
    <ResponsiveDrawer>
      <Box sx={{ p: { xs: 2, sm: 3 }, width: "100%", minHeight: "100vh" }}>
        {/* Header */}
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 4,
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Typography
            variant="h4"
            component="h1"
            sx={{ fontWeight: 700, mb: { xs: 2, sm: 0 } }}
          >
            Expense Dashboard
          </Typography>
          <Button
            variant="contained"
            color="error"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{ width: { xs: "100%", sm: "auto" } }}
          >
            Add New Expense
          </Button>
        </Box>

        {/* Summary Cards */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Expense Summary
        </Typography>
        <Box
          sx={{
            display: "grid",
            gridTemplateColumns: {
              xs: "1fr",
              sm: "repeat(2,1fr)",
              md: "repeat(3,1fr)",
            },
            gap: 3,
            mb: 5,
          }}
        >
          <StatisticCard
            title="Total Expense (Lifetime)"
            amount={summary.totalExpense}
            icon={<TrendingDownIcon />}
            iconColor="error"
          />
          <StatisticCard
            title="Expense Last 30 Days"
            amount={summary.last30DaysExpense}
            icon={<ArrowDownwardIcon />}
            iconColor="error"
          />
        </Box>

        {/* BarChart */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Last 30 Days Expenses
        </Typography>
        <Card sx={{ borderRadius: 2, boxShadow: 3, mb: 5, p: 3 }}>
          {isLoadingTransactions ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 300,
              }}
            >
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Loading Chart...</Typography>
            </Box>
          ) : chartData.length === 0 ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                height: 300,
              }}
            >
              <Typography variant="body1" color="text.secondary">
                No data available for chart
              </Typography>
            </Box>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis
                  dataKey="dayLabel"
                  tick={{ fontSize: 10 }}
                  interval="preserveStartEnd"
                />
                <YAxis />
                <Tooltip formatter={(value) => `Rs. ${value.toFixed(2)}`} />
                <Legend />
                <Bar dataKey="expense" fill="#f44336" name="Expense" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Transactions List */}
        <Typography variant="h5" sx={{ mb: 2, fontWeight: 600 }}>
          Recent Expenses
        </Typography>
        <Card sx={{ borderRadius: 2, boxShadow: 1 }}>
          {isLoadingTransactions ? (
            <Box
              sx={{
                display: "flex",
                justifyContent: "center",
                p: 4,
                alignItems: "center",
              }}
            >
              <CircularProgress size={24} />
              <Typography sx={{ ml: 2 }}>Loading Expenses...</Typography>
            </Box>
          ) : transactions.length === 0 ? (
            <Box sx={{ p: 4, textAlign: "center" }}>
              <Typography variant="h6" color="text.secondary">
                No expense transactions found.
              </Typography>
              <Typography variant="body2" color="text.secondary">
                Add your first expense record above!
              </Typography>
            </Box>
          ) : (
            <List>
              {transactions.map((tx, index) => (
                <React.Fragment key={tx._id || index}>
                  <ListItem
                    sx={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                      py: 1,
                    }}
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography variant="body1" sx={{ fontWeight: 500 }}>
                        {tx.category}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(tx.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Box sx={{ display: "flex", alignItems: "center" }}>
                      <Typography
                        variant="body1"
                        sx={{ fontWeight: 600, color: "error.main", mr: 2 }}
                      >
                        - Rs. {parseFloat(tx.amount).toFixed(2)}
                      </Typography>
                      <IconButton
                        aria-label="delete"
                        size="small"
                        color="error"
                        onClick={() => handleDelete(tx._id)}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </ListItem>
                  {index < transactions.length - 1 && (
                    <Divider component="li" />
                  )}
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>

        {/* Add Expense Dialog */}
        <Dialog open={open} onClose={handleClose}>
          <DialogTitle>Add New Expense Record</DialogTitle>
          <Box sx={{ width: { xs: "90%", sm: 400 }, margin: "0 auto" }}>
            <DialogContent>
              <Stack spacing={2}>
                <TextField
                  autoFocus
                  required
                  margin="dense"
                  id="category"
                  name="category"
                  label="Category (e.g., Groceries, Rent, Utilities)"
                  type="text"
                  fullWidth
                  variant="outlined"
                  value={expenseData.category}
                  onChange={handleChange}
                />
                <TextField
                  required
                  margin="dense"
                  id="amount"
                  name="amount"
                  label="Amount"
                  type="number"
                  fullWidth
                  variant="outlined"
                  inputProps={{ step: "0.01" }}
                  value={expenseData.amount}
                  onChange={handleChange}
                />
                <TextField
                  required
                  margin="dense"
                  id="date"
                  name="date"
                  label="Date"
                  type="date"
                  fullWidth
                  variant="outlined"
                  InputLabelProps={{ shrink: true }}
                  value={expenseData.date}
                  onChange={handleChange}
                />
              </Stack>
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} color="primary" disabled={loading}>
                Cancel
              </Button>
              <Button
                variant="contained"
                color="error"
                onClick={submitExpense}
                disabled={loading}
              >
                {loading ? "Submitting..." : "Submit Expense"}
              </Button>
            </DialogActions>
          </Box>
        </Dialog>
      </Box>
    </ResponsiveDrawer>
  );
};

export default Expense;
