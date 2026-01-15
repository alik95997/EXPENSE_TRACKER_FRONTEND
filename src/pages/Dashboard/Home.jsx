import React, { useState, useEffect } from "react";
import {
  RadialBarChart,
  RadialBar,
  Legend,
  ResponsiveContainer,
  Tooltip,
} from "recharts";
import { Box, Typography, Card, useTheme } from "@mui/material";
import AccountBalanceWalletIcon from "@mui/icons-material/AccountBalanceWallet";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import ArrowUpwardIcon from "@mui/icons-material/ArrowUpward";
import ArrowDownwardIcon from "@mui/icons-material/ArrowDownward";
import ResponsiveDrawer from "../../components/layouts/HomeLayout";
import * as XLSX from "xlsx";
import api from "../../utils/api";
import StatisticCard from "../../components/Cards/StatisticCard";
import RecentTransactionsList from "../../components/RecentTransactionsList/RecentTransactionsList";
import LoadingScreen from "../../components/LoadingScreen/LoadingScreen";
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

  const exportToExcel = () => {
    const exportData = allTransactions.map((tx) => ({
      Date: new Date(tx.date).toLocaleDateString(),
      Category: tx.category || tx.title || "General Transaction",
      Type: tx.type === "income" ? "Income" : "Expense",
      Amount: `Rs. ${parseFloat(tx.amount).toFixed(2)}`,
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
      const incomeRes = await api.get("/income/getincome");
      const expenseRes = await api.get("/expense/getexpense");

      const incomeData = incomeRes.data?.data || [];
      const expenseData = expenseRes.data?.data || [];

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
          {isLoading && <LoadingScreen />}
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
              iconColor={summary.totalBalance >= 0 ? "success" : "error"}
            />
            <StatisticCard
              title="Total Income"
              amount={summary.totalIncome}
              icon={<MonetizationOnIcon />}
              iconColor="success"
            />
            <StatisticCard
              title="Total Expense"
              amount={summary.totalExpense}
              icon={<TrendingDownIcon />}
              iconColor="error"
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
                  <ResponsiveContainer width="100%" height={300}>
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
                          return `${value}: Rs. ${entry.payload.value.toFixed(
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
                                  Rs. {payload[0].value.toFixed(2)} (
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
                      Rs. {summary.totalBalance.toFixed(2)}
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
