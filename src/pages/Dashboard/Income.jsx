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
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import DeleteIcon from "@mui/icons-material/Delete";
import ResponsiveDrawer from "../../components/layouts/HomeLayout";

const token = localStorage.getItem("token");

// --- Helper Component ---
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

// --- Format data for BarChart ---
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
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
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

  // --- Fetch income (token-based) ---
  const fetchIncome = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(
        "https://https://expense-tracker-backend-eight-pearl.vercel.app/api/income/getincome",
        {
          headers: {
            Authorization: `Bearer ${token}`,
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
    if (!incomeData.category || !incomeData.amount) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        "https://expense-tracker-backend-eight-pearl.vercel.app/api/income/addincome",
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
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
        alert(result.message);
      }
    } catch (error) {
      console.error("Error adding income:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Delete Income ---
  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      const response = await fetch(
        `https://expense-tracker-backend-eight-pearl.vercel.app/api/income/deleteincome/${id}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      if (response.ok) {
        setRefreshKey((prev) => prev + 1);
      }
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [refreshKey]);

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
            onClick={() => setOpen(true)}
          >
            Add New Income
          </Button>
        </Box>

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

        <Card sx={{ mt: 4, p: 2 }}>
          {isLoading ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CircularProgress />
              <Typography>Loading data...</Typography>
            </Box>
          ) : transactions.length === 0 ? (
            <Typography sx={{ textAlign: "center", py: 3 }}>
              No income records found.
            </Typography>
          ) : (
            <List>
              {transactions.map((tx) => (
                <React.Fragment key={tx._id}>
                  <ListItem
                    secondaryAction={
                      <IconButton color="error" onClick={() => handleDelete(tx._id)}>
                        <DeleteIcon />
                      </IconButton>
                    }
                  >
                    <Box sx={{ flexGrow: 1 }}>
                      <Typography fontWeight={600}>{tx.category}</Typography>
                      <Typography variant="caption">
                        {new Date(tx.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                    <Typography fontWeight={600} color="success.main">
                      +${tx.amount}
                    </Typography>
                  </ListItem>
                  <Divider />
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>

        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add New Income</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Category"
                name="category"
                value={incomeData.category}
                onChange={handleChange}
              />
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={incomeData.amount}
                onChange={handleChange}
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={incomeData.date}
                onChange={handleChange}
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button onClick={submitIncome} variant="contained" color="success">
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ResponsiveDrawer>
  );
};

export default Income;
