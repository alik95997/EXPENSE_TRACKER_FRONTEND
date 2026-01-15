import React from "react";
import { Card, CardContent, Box, Typography, useTheme } from "@mui/material";

const StatisticCard = ({ title, amount, icon, iconColor = "primary" }) => {
  const theme = useTheme();

  // Format amount handling both string and numbers
  const formattedAmount = `Rs. ${(Number(amount) || 0).toLocaleString("en-US", {
    minimumFractionDigits: 2,
  })}`;

  // Determine color value from theme or direct string
  const getColor = (colorName) => {
    if (theme.palette[colorName]) {
      return theme.palette[colorName].main;
    }
    return colorName;
  };

  const finalColor = getColor(iconColor);

  return (
    <Card sx={{ height: "100%", borderRadius: 2, boxShadow: 3 }}>
      <CardContent>
        <Box sx={{ display: "flex", alignItems: "center", mb: 1 }}>
          <Box
            sx={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              color: finalColor,
              mr: 1.5,
              "& svg": { fontSize: 30 },
            }}
          >
            {icon}
          </Box>
          <Typography
            variant="subtitle2"
            color="text.secondary"
            sx={{ textTransform: "uppercase", fontWeight: 600 }}
          >
            {title}
          </Typography>
        </Box>
        <Typography
          variant="h4"
          component="div"
          sx={{ fontWeight: 700, color: finalColor }}
        >
          {formattedAmount}
        </Typography>
      </CardContent>
    </Card>
  );
};

export default StatisticCard;
