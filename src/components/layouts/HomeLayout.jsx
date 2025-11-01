import * as React from "react";
import PropTypes from "prop-types";
import {
  AppBar,
  Box,
  CssBaseline,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Avatar,
  Tooltip,
} from "@mui/material";
import MenuIcon from "@mui/icons-material/Menu";
import AccountCircleIcon from "@mui/icons-material/AccountCircle";
import DashboardIcon from "@mui/icons-material/Dashboard";
import MonetizationOnIcon from "@mui/icons-material/MonetizationOn";
import TrendingDownIcon from "@mui/icons-material/TrendingDown";
import LogoutIcon from "@mui/icons-material/Logout";
import { Link, useLocation, useNavigate } from "react-router-dom";

const drawerWidth = 200;

function ResponsiveDrawer(props) {
  const { window, children } = props;
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const [isClosing, setIsClosing] = React.useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const name = localStorage.getItem("userName");

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.clear();
    navigate("/login");
    handleDrawerClose();
    
  };

  const handleDrawerClose = () => {
    setIsClosing(true);
    setMobileOpen(false);
  };

  const handleDrawerTransitionEnd = () => setIsClosing(false);
  const handleDrawerToggle = () => {
    if (!isClosing) setMobileOpen(!mobileOpen);
  };

  const navItems = [
    { text: "Dashboard", icon: <DashboardIcon />, url: "/" },
    { text: "Income", icon: <MonetizationOnIcon />, url: "/income" },
    { text: "Expense", icon: <TrendingDownIcon />, url: "/expense" },
  ];

  const drawer = (
    <Box
      sx={{
        height: "100%",
        display: "flex",
        flexDirection: "column",
        bgcolor: "#fafafa",
      }}
    >
      <Toolbar>
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Avatar
            sx={{
              width: 44,
              height: 44,
              bgcolor: "var(--color-purple-600)",
              border: "2px solid var(--color-purple-600)",
            }}
          >
            <AccountCircleIcon sx={{ fontSize: 40, color: "white" }} />
          </Avatar>
          <Box>
            <Typography variant="subtitle1" sx={{ fontWeight: "bold" }}>
              {name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              Profile
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider sx={{ mb: 1 }} />

      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.url;
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                component={Link}
                to={item.url}
                sx={{
                  mx: 1,
                  mb: 0.8,
                  borderRadius: "10px",
                  transition: "0.25s",
                  bgcolor: active ? "var(--color-purple-600)" : "transparent",
                  color: active ? "white" : "inherit",
                  "&:hover": {
                    bgcolor: active
                      ? "var(--color-purple-600)"
                      : "rgba(124, 58, 237, 0.08)",
                  },
                }}
              >
                <ListItemIcon
                  sx={{
                    color: active ? "white" : "var(--color-purple-600)",
                    minWidth: 40,
                  }}
                >
                  {item.icon}
                </ListItemIcon>
                <ListItemText
                  primary={item.text}
                  primaryTypographyProps={{
                    fontWeight: active ? "bold" : "medium",
                  }}
                />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>

      <Box sx={{ p: 2, borderTop: "1px solid #eee" }}>
        <Tooltip title="Logout">
          <ListItemButton
            onClick={handleLogout}
            sx={{
              borderRadius: 2,
              color: "error.main",
              "&:hover": { bgcolor: "#fee" },
            }}
          >
            <ListItemIcon sx={{ color: "error.main" }}>
              <LogoutIcon />
            </ListItemIcon>
            <ListItemText primary="Logout" />
          </ListItemButton>
        </Tooltip>
      </Box>
    </Box>
  );

  const container =
    window !== undefined ? () => window().document.body : undefined;

  return (
    <Box sx={{ display: "flex", bgcolor: "#f4f5f7" }}>
      <CssBaseline />
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          background: "var(--color-purple-600)",
          boxShadow: "0 4px 12px rgba(124,58,237,0.3)",
        }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: "none" } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ fontWeight: "bold", letterSpacing: 0.5 }}
          >
            Expense Tracker
          </Typography>
        </Toolbar>
      </AppBar>

      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          container={container}
          variant="temporary"
          open={mobileOpen}
          onTransitionEnd={handleDrawerTransitionEnd}
          onClose={handleDrawerClose}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: "block", sm: "none" },
            "& .MuiDrawer-paper": { width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>

        <Drawer
          variant="permanent"
          sx={{
            display: { xs: "none", sm: "block" },
            "& .MuiDrawer-paper": {
              width: drawerWidth,
              borderRight: "none",
              boxShadow: "2px 0 6px rgba(0,0,0,0.05)",
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          // 1. Critical: Allows the content to shrink and properly fill the space
          minWidth: 0,
          // 2. Explicitly sets the width for large screens (sm and up)
          width: { sm: `calc(100% - ${drawerWidth}px)` },

          minHeight: "100vh",
          bgcolor: "#f9fafb",
        }}
      >
        <Toolbar />
        {children}
      </Box>
    </Box>
  );
}

ResponsiveDrawer.propTypes = {
  window: PropTypes.func,
  children: PropTypes.node.isRequired,
};

export default ResponsiveDrawer;
