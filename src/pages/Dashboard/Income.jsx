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
import api from "../../utils/api";
import StatisticCard from "../../components/Cards/StatisticCard";
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

  return last30Days.slice(1); // To include exactly the last 30 days, we remove the first entry (30 days ago) if we loop from 30 down to 0, or adjust the loop boundary. Keeping this for simplicity as it maintains the structure of the original function.
};

// --- Main Income Component ---
const Income = () => {
  // const { data, error, isLoading } = useGetIncomeQuery();
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [transactions, setTransactions] = useState([]);
  const [Loadingg, setLoadingg] = useState(true);
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
    // Set the check point 30 days ago, starting at midnight
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
    thirtyDaysAgo.setHours(0, 0, 0, 0);

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

  const fetchIncome = async () => {
    setLoadingg(true);
    try {
      const response = await api.get("/income/getincome");
      const result = response.data;
      if (response.status === 200) {
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
      setLoadingg(false);
    }
  };

  const submitIncome = async () => {
    if (!incomeData.category || !incomeData.amount) {
      alert("Please fill all fields");
      return;
    }

    setLoading(true);
    console.log(incomeData);
    try {
      const response = await api.post("/income/addincome", incomeData);

      const result = response.data;
      if (response.status === 200 || response.status === 201) {
        setOpen(false);
        setIncomeData({
          category: "",
          amount: "",
          date: new Date().toISOString().slice(0, 10),
        });
        setRefreshKey((prev) => prev + 1); // Trigger refresh
      } else {
        alert(result.message);
      }
    } catch (error) {
      console.error("Error adding income:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Delete this record?")) return;

    try {
      const response = await api.delete(`/income/deleteincome/${id}`);
      if (response.status === 200) {
        setRefreshKey((prev) => prev + 1); // Trigger refresh
      } else {
        const result = response.data;
        alert(result.message || "Failed to delete income.");
      }
    } catch (error) {
      console.error("Error deleting income:", error);
    }
  };

  useEffect(() => {
    fetchIncome();
  }, [refreshKey]); // Dependency on refreshKey to refetch after CRUD operations

  return (
    <ResponsiveDrawer>
      <Box sx={{ p: 3 }}>
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            mb: 3,
            alignItems: "center",
            flexDirection: { xs: "column", sm: "row" },
          }}
        >
          <Typography variant="h4" fontWeight={700}>
            Income Dashboard
          </Typography>
          <Button
            variant="contained"
            color="success"
            startIcon={<AddIcon />}
            onClick={() => setOpen(true)}
            sx={{
              width: { xs: "100%", sm: "auto" },
              mt: { xs: 2, sm: 0 },
            }}
          >
            Add New Income
          </Button>
        </Box>

        {/* Statistic Cards */}
        <Box
          sx={{
            display: "grid",
            gap: 3,
            gridTemplateColumns: "repeat(auto-fit, minmax(250px, 1fr))",
          }}
        >
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

        {/* Income Chart (NEWLY ADDED) */}
        <Card sx={{ mt: 4, p: 2, height: 350 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Income Trend (Last 30 Days)
          </Typography>
          {Loadingg ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CircularProgress />
              <Typography>Loading chart data...</Typography>
            </Box>
          ) : chartData.length === 0 ? (
            <Typography
              sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
            >
              Not enough data to display a chart.
            </Typography>
          ) : (
            <ResponsiveContainer width="100%" height={300}>
              <BarChart
                data={chartData}
                margin={{ top: 5, right: 10, left: 0, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="dayName" stroke="#333" />
                <YAxis stroke="#333" formatter={(value) => `Rs. ${value}`} />
                <Tooltip
                  formatter={(value) => [`Rs. ${value.toFixed(2)}`, "Income"]}
                  labelFormatter={(label, props) =>
                    props.length > 0
                      ? `${props[0].payload.date} (${label})`
                      : label
                  }
                />
                <Bar dataKey="income" fill="#4caf50" name="Daily Income" />
              </BarChart>
            </ResponsiveContainer>
          )}
        </Card>

        {/* Income Transactions List */}
        <Card sx={{ mt: 4, p: 2 }}>
          <Typography variant="h6" fontWeight={600} gutterBottom>
            Recent Transactions
          </Typography>
          {Loadingg ? (
            <Box sx={{ textAlign: "center", py: 5 }}>
              <CircularProgress />
              <Typography>Loading transactions...</Typography>
            </Box>
          ) : transactions.length === 0 ? (
            <Typography
              sx={{ textAlign: "center", py: 3, color: "text.secondary" }}
            >
              No income records found.
            </Typography>
          ) : (
            <List>
              {transactions.map((tx) => (
                <React.Fragment key={tx._id}>
                  <ListItem
                    secondaryAction={
                      <IconButton
                        color="error"
                        onClick={() => handleDelete(tx._id)}
                      >
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
                      + Rs. {parseFloat(tx.amount).toFixed(2)}
                    </Typography>
                  </ListItem>
                  <Divider component="li" />
                </React.Fragment>
              ))}
            </List>
          )}
        </Card>

        {/* Add Income Dialog */}
        <Dialog open={open} onClose={() => setOpen(false)}>
          <DialogTitle>Add New Income</DialogTitle>
          <DialogContent>
            <Stack spacing={2}>
              <TextField
                label="Category"
                name="category"
                value={incomeData.category}
                onChange={handleChange}
                fullWidth
                margin="dense"
              />
              <TextField
                label="Amount"
                name="amount"
                type="number"
                value={incomeData.amount}
                onChange={handleChange}
                fullWidth
                margin="dense"
                inputProps={{ min: "0.01", step: "0.01" }}
              />
              <TextField
                label="Date"
                name="date"
                type="date"
                value={incomeData.date}
                onChange={handleChange}
                fullWidth
                margin="dense"
                InputLabelProps={{ shrink: true }}
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpen(false)}>Cancel</Button>
            <Button
              onClick={submitIncome}
              variant="contained"
              color="success"
              disabled={loading}
            >
              {loading ? "Saving..." : "Save"}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </ResponsiveDrawer>
  );
};

export default Income;
