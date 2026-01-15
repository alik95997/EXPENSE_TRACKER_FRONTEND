import { Box, Stack, Typography, CircularProgress } from "@mui/material";
const LoadingScreen = () => {
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
        <Typography variant="h6">Loading ...</Typography>
      </Stack>
    </Box>
  );
};
export default LoadingScreen;
