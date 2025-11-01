import React, { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import {
  Box,
  Typography,
  Card,
  CircularProgress,
  Stack,
  List,
  ListItem,
  Divider,
  useTheme,
  ListItemIcon,
  Button,
} from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import DownloadIcon from "@mui/icons-material/Download";
import ResponsiveDrawer from "../../components/layouts/HomeLayout";
import * as XLSX from "xlsx";

// --- StatisticCard ---
const StatisticCard = ({ title, amount, icon: IconComponent, color }) => {
  const theme = useTheme();
  const formattedAmount = `$${amount.toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;
  const Icon = IconComponent.type;

  const colorValue = theme.palette[color]?.main || theme.palette.primary.main;

  return (
    <Card
      elevation={4}
      sx={{
        height: "100%",
        borderRadius: 3,
        background: theme.palette.background.paper,
        p: 3,
        transition: "all 0.3s ease-in-out",
        "&:hover": {
          transform: "translateY(-4px)",
          boxShadow: theme.shadows[10],
        },
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 1.5,
        }}
      >
        <Typography
          variant="subtitle2"
          sx={{
            textTransform: "uppercase",
            fontWeight: 600,
            color: theme.palette.text.secondary,
            letterSpacing: "0.5px",
          }}
        >
          {title}
        </Typography>
        <Icon sx={{ fontSize: 28, color: colorValue }} />
      </Box>
      <Typography
        variant="h4"
        sx={{
          fontWeight: 700,
          color: colorValue,
          mt: 1,
          letterSpacing: "-0.5px",
        }}
      >
        {formattedAmount}
      </Typography>
    </Card>
  );
};

// --- RecentTransactionsList ---
const RecentTransactionsList = ({ transactions, limit = 8, onExport }) => {
  const recentTx = transactions.slice(0, limit);
  const theme = useTheme();

  return (
    <Card
      elevation={4}
      sx={{
        borderRadius: 3,
        boxShadow: theme.shadows[4],
        height: "100%",
        p: 3,
        background: theme.palette.background.paper,
      }}
    >
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 2.5,
        }}
      >
        <Typography variant="h6" sx={{ fontWeight: 700 }}>
          Recent Transactions
        </Typography>
        <Button
          variant="outlined"
          color="primary"
          size="small"
          startIcon={<DownloadIcon />}
          onClick={onExport}
          disabled={transactions.length === 0}
          sx={{ textTransform: "none" }}
        >
          Export
        </Button>
      </Box>

      {recentTx.length === 0 ? (
        <Box
          sx={{
            p: 4,
            textAlign: "center",
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
          }}
        >
          <Typography variant="body1" color="text.secondary">
            No transactions recorded yet.
          </Typography>
        </Box>
      ) : (
        <List disablePadding>
          {recentTx.map((tx, index) => {
            const Icon = tx.displayIcon.type;
            return (
              <React.Fragment key={tx._id || index}>
                <ListItem
                  sx={{
                    display: "flex",
                    justifyContent: "space-between",
                    alignItems: "center",
                    py: 1.3,
                    px: 0,
                  }}
                >
                  <Box sx={{ display: "flex", alignItems: "center" }}>
                    <ListItemIcon sx={{ minWidth: 40 }}>
                      <Icon color={tx.color} sx={{ fontSize: 22 }} />
                    </ListItemIcon>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600 }}>
                        {tx.category || tx.title || "General Transaction"}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {new Date(tx.date).toLocaleDateString()}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography
                    variant="body2"
                    sx={{
                      fontWeight: 700,
                      color: theme.palette[tx.color].main,
                    }}
                  >
                    {tx.type === "expense" ? "-" : "+"}${tx.amount.toFixed(2)}
                  </Typography>
                </ListItem>
                {index < recentTx.length - 1 && <Divider component="li" />}
              </React.Fragment>
            );
          })}
        </List>
      )}
    </Card>
  );
};

// --- processRadialChartData ---
const processRadialChartData = (totalIncome, totalExpense) => {
  const total = totalIncome + totalExpense;
  if (total === 0) return [];

  return [
    {
      name: "Expense",
      value: totalExpense,
      fill: "#f44336",
      percentage: ((totalExpense / total) * 100).toFixed(1),
    },
    {
      name: "Income",
      value: totalIncome,
      fill: "#4caf50",
      percentage: ((totalIncome / total) * 100).toFixed(1),
    },
  ];
};

// --- Home ---
const Home = () => {
  const theme = useTheme();
  const [summary, setSummary] = useState({
    totalIncome: 0.0,
    totalExpense: 0.0,
    totalBalance: 0.0,
  });
  const [allTransactions, setAllTransactions] = useState([]);
  const [chartData, setChartData] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // Export to Excel function
  const exportToExcel = () => {
    const exportData = allTransactions.map((tx) => ({
      Date: new Date(tx.date).toLocaleDateString(),
      Category: tx.category || tx.title || "General Transaction",
      Type: tx.type === "income" ? "Income" : "Expense",
      Amount: `$${parseFloat(tx.amount).toFixed(2)}`,
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportData);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, "Transactions");

    worksheet["!cols"] = [{ wch: 15 }, { wch: 30 }, { wch: 10 }, { wch: 12 }];

    const fileName = `Transactions_${new Date()
      .toLocaleDateString()
      .replace(/\//g, "-")}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  const fetchAllData = async () => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");

      const [incomeRes, expenseRes] = await Promise.all([
        fetch("https://expense-tracker-backend-m2rbt680o-alik95997s-projects.vercel.app/api/income/getincome", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
        fetch("https://expense-tracker-backend-m2rbt680o-alik95997s-projects.vercel.app/api/expense/getexpense", {
          headers: { Authorization: `Bearer ${token}` },
        }).then((r) => r.json()),
      ]);

      const incomeData = incomeRes.data || [];
      const expenseData = expenseRes.data || [];

      const combined = [
        ...incomeData.map((tx) => ({
          ...tx,
          type: "income",
          displayIcon: <ArrowUpwardIcon />,
          color: "success",
        })),
        ...expenseData.map((tx) => ({
          ...tx,
          type: "expense",
          displayIcon: <ArrowDownwardIcon />,
          color: "error",
        })),
      ].sort((a, b) => new Date(b.date) - new Date(a.date));

      setAllTransactions(combined);

      const totalIncome = incomeData.reduce(
        (sum, tx) => sum + (parseFloat(tx.amount) || 0),
        0
      );
      const totalExpense = expenseData.reduce(
        (sum, tx) => sum + (parseFloat(tx.amount) || 0),
        0
      );

      setSummary({
        totalIncome,
        totalExpense,
        totalBalance: totalIncome - totalExpense,
      });

      setChartData(processRadialChartData(totalIncome, totalExpense));
    } catch {
      setSummary({ totalIncome: 0, totalExpense: 0, totalBalance: 0 });
      setAllTransactions([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAllData();
  }, []);

  if (isLoading) {
    return (
      <Box
        sx={{
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          minHeight: "100vh",
        }}
      >
        <Stack direction="row" spacing={2} alignItems="center">
          <CircularProgress />
          <Typography variant="h6">Loading Dashboard...</Typography>
        </Stack>
      </Box>
    );
  }

  return (
    <ResponsiveDrawer>
      <Box
        sx={{
          p: { xs: 2, sm: 3 },
          flexGrow: 1,
          minHeight: "100vh",
          width: "100%",
          backgroundColor: "background.default",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
        }}
      >
        <Box sx={{ width: "100%", maxWidth: "1200px", mx: "auto" }}>
          <Typography
            variant="h4"
            sx={{
              fontWeight: 700,
              mb: 5,
              color: "text.primary",
              letterSpacing: "0px",
            }}
          >
            Dashboard Overview
          </Typography>

          {/* --- Stats Row --- */}
          <Box
            sx={{
              mb: 5,
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                sm: "repeat(2, 1fr)",
                md: "repeat(3, 1fr)",
              },
              gap: 3,
            }}
          >
            <StatisticCard
              title="Total Balance"
              amount={summary.totalBalance}
              icon={<AccountBalanceWalletIcon />}
              color={summary.totalBalance >= 0 ? "success" : "error"}
            />
            <StatisticCard
              title="Total Income"
              amount={summary.totalIncome}
              icon={<MonetizationOnIcon />}
              color="success"
            />
            <StatisticCard
              title="Total Expense"
              amount={summary.totalExpense}
              icon={<TrendingDownIcon />}
              color="error"
            />
          </Box>

          {/* --- Chart + Transactions --- */}
          <Box
            sx={{
              display: "grid",
              gridTemplateColumns: {
                xs: "1fr",
                md: "repeat(2, 1fr)",
              },
              gap: 5,
            }}
          >
            <Card
              elevation={4}
              sx={{
                borderRadius: 3,
                p: 3,
                background: theme.palette.background.paper,
              }}
            >
              <Typography variant="h6" sx={{ mb: 3, fontWeight: 700 }}>
                Income vs Expense Breakdown
              </Typography>
              {chartData.length ? (
                <Box sx={{ position: "relative", width: "100%", height: 400 }}>
                  <ResponsiveContainer width="100%" height="100%">
                    <RadialBarChart
                      cx="45%"
                      cy="50%"
                      innerRadius="30%"
                      outerRadius="80%"
                      barSize={25}
                      data={chartData}
                    >
                      <RadialBar
                        minAngle={15}
                        label={{
                          position: "insideStart",
                          fill: "#fff",
                          fontWeight: "bold",
                        }}
                        background
                        clockWise
                        dataKey="value"
                      />
                      <Legend
                        iconSize={12}
                        layout="centric"
                        verticalAlign="top"
                        align="right"
                        wrapperStyle={{
                          paddingLeft: "20px",
                        }}
                        formatter={(value, entry) => {
                          return `${value}: $${entry.payload.value.toFixed(
                            2
                          )} (${entry.payload.percentage}%)`;
                        }}
                      />
                      <Tooltip
                        content={({ active, payload }) => {
                          if (active && payload && payload.length) {
                            return (
                              <Box
                                sx={{
                                  backgroundColor:
                                    theme.palette.background.paper,
                                  border: `1px solid ${theme.palette.divider}`,
                                  borderRadius: "8px",
                                  p: 1.5,
                                }}
                              >
                                <Typography
                                  variant="body2"
                                  sx={{ fontWeight: 600 }}
                                >
                                  {payload[0].name}
                                </Typography>
                                <Typography
                                  variant="body2"
                                  color="text.secondary"
                                >
                                  ${payload[0].value.toFixed(2)} (
                                  {payload[0].payload.percentage}%)
                                </Typography>
                              </Box>
                            );
                          }
                          return null;
                        }}
                      />
                    </RadialBarChart>
                  </ResponsiveContainer>
                  <Box
                    sx={{
                      position: "absolute",
                      top: "50%",
                      left: "45%",
                      transform: "translate(-50%, -50%)",
                      textAlign: "center",
                      pointerEvents: "none",
                    }}
                  >
                    <Typography variant="caption" color="text.secondary">
                      Net Balance
                    </Typography>
                    <Typography
                      variant="h5"
                      sx={{
                        fontWeight: 700,
                        color:
                          summary.totalBalance >= 0
                            ? theme.palette.success.main
                            : theme.palette.error.main,
                      }}
                    >
                      ${summary.totalBalance.toFixed(2)}
                    </Typography>
                  </Box>
                </Box>
              ) : (
                <Box
                  sx={{
                    p: 4,
                    textAlign: "center",
                    height: 400,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "center",
                  }}
                >
                  <Typography variant="body1" color="text.secondary">
                    Not enough data to display chart.
                  </Typography>
                </Box>
              )}
            </Card>

            <RecentTransactionsList
              transactions={allTransactions}
              limit={8}
              onExport={exportToExcel}
            />
          </Box>
        </Box>
      </Box>
    </ResponsiveDrawer>
  );
};

export default Home;
