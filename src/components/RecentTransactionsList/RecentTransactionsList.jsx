import { useTheme } from "@mui/material";
import React from "react";
import {
  Card,
  Box,
  Typography,
  Button,
  List,
  ListItem,
  ListItemIcon,
  Divider,
} from "@mui/material";
import DownloadIcon from "@mui/icons-material/Download";
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
                    {tx.type === "expense" ? "-" : "+"} Rs.{" "}
                    {tx.amount.toFixed(2)}
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
export default RecentTransactionsList;
