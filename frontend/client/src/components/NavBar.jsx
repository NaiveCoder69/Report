import React, { useContext, useState } from 'react';
import {
  AppBar,
  Toolbar,
  Typography,
  Button,
  CircularProgress,
  Box,
  Divider,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import ChatIcon from '@mui/icons-material/Chat'; // Add this import
import { Link, useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

// Updated navLinks - CHAT ADDED FIRST
const navLinks = [
  { path: "/chat", label: "Chat", icon: <ChatIcon /> }, // 🚀 NEW
  { path: "/dashboard", label: "Dashboard" },
  { path: "/projects", label: "Projects" },
  { path: "/materials", label: "Materials", roles: ["admin", "engineer"] },
  { path: "/bills", label: "Billing", roles: ["admin", "accountant"] },
  { path: "/expenses", label: "Expenses" },
  { path: "/delivery", label: "Delivery", roles: ["admin", "engineer"] },
  { path: "/notifications", label: "Alerts", roles: ["admin", "accountant"] },
  { path: "/vendors", label: "Vendors", roles: ["admin", "engineer"] },
  { path: "/labor-contractors", label: "Labours", roles: ["admin", "engineer"] },
];

export default function NavBar() {
  const { user, logout, authLoading } = useContext(AuthContext);
  const role = (user?.role || '').toLowerCase();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  const toggleDrawer = () => {
    setMobileOpen((prev) => !prev);
  };

  if (authLoading) {
    return (
      <AppBar position="static" sx={{ mb: 2 }}>
        <Toolbar>
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            Construction Dashboard
          </Typography>
          <CircularProgress color="inherit" size={28} />
        </Toolbar>
      </AppBar>
    );
  }

  // Links filtered by role
  const filteredLinks = navLinks.filter(
    (link) => !link.roles || link.roles.includes(role)
  );

  // Drawer content (mobile)
  const drawer = (
    <Box sx={{ width: 260 }} role="presentation" onClick={toggleDrawer}>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 600 }}>
          Construction Dashboard
        </Typography>
      </Box>
      <Divider />
      <List>
        {user && filteredLinks.map((link) => (
          <ListItem key={link.path} disablePadding>
            <ListItemButton component={Link} to={link.path}>
              <ListItemText primary={link.label} />
            </ListItemButton>
          </ListItem>
        ))}

        {user && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/company/invite">
                <ListItemText primary="Invite" />
              </ListItemButton>
            </ListItem>
            {role === 'admin' && (
              <ListItem disablePadding>
                <ListItemButton component={Link} to="/join-requests-admin">
                  <ListItemText primary="Approvals" />
                </ListItemButton>
              </ListItem>
            )}
            <Divider />
            <ListItem disablePadding>
              <ListItemButton onClick={handleLogout}>
                <ListItemText primary="Logout" />
              </ListItemButton>
            </ListItem>
          </>
        )}

        {!user && (
          <>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/login">
                <ListItemText primary="Login" />
              </ListItemButton>
            </ListItem>
            <ListItem disablePadding>
              <ListItemButton component={Link} to="/register">
                <ListItemText primary="Register" />
              </ListItemButton>
            </ListItem>
          </>
        )}
      </List>
    </Box>
  );

  return (
    <>
      <AppBar
        position="static"
        sx={{
          mb: 2,
          backgroundColor: '#0B3D91',
          boxShadow: '0 2px 6px rgba(0,0,0,0.18)',
        }}
      >
        <Toolbar sx={{ minHeight: 64 }}>
          {/* Left: Logo & title */}
          <Typography
            variant="h6"
            sx={{
              fontWeight: 600,
              letterSpacing: 0.5,
            }}
          >
            Construction Dashboard
          </Typography>

          {/* Desktop / tablet: main nav + actions */}
          <Box
            sx={{
              flexGrow: 1,
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              ml: 4,
              gap: 1.5,
            }}
          >
            {user && filteredLinks.map((link) => (
              <Button
                key={link.path}
                color="inherit"
                component={Link}
                to={link.path}
                startIcon={link.icon} // 🚀 Chat icon
                sx={{
                  textTransform: 'none',
                  fontSize: 14,
                  px: 1.5,
                }}
              >
                {link.label}
              </Button>
            ))}
          </Box>

          {/* Desktop / tablet: right actions */}
          <Box
            sx={{
              display: { xs: 'none', md: 'flex' },
              alignItems: 'center',
              gap: 1.5,
            }}
          >
            {user ? (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/company/invite"
                  sx={{
                    textTransform: 'none',
                    fontSize: 14,
                    borderRadius: 20,
                    px: 2,
                    border: '1px solid rgba(255,255,255,0.5)',
                  }}
                >
                  Invite
                </Button>
                {role === 'admin' && (
                  <Button
                    color="inherit"
                    component={Link}
                    to="/join-requests-admin"
                    sx={{
                      textTransform: 'none',
                      fontSize: 14,
                      borderRadius: 20,
                      px: 2,
                      backgroundColor: 'rgba(255,255,255,0.12)',
                      '&:hover': {
                        backgroundColor: 'rgba(255,255,255,0.2)',
                      },
                    }}
                  >
                    Approvals
                  </Button>
                )}
                <Divider
                  orientation="vertical"
                  flexItem
                  sx={{ borderColor: 'rgba(255,255,255,0.3)' }}
                />
                <Button
                  color="inherit"
                  onClick={handleLogout}
                  sx={{
                    textTransform: 'none',
                    fontSize: 14,
                    borderRadius: 20,
                    px: 2,
                  }}
                >
                  Logout
                </Button>
              </>
            ) : (
              <>
                <Button
                  color="inherit"
                  component={Link}
                  to="/login"
                  sx={{ textTransform: 'none', fontSize: 14 }}
                >
                  Login
                </Button>
                <Button
                  color="inherit"
                  component={Link}
                  to="/register"
                  sx={{
                    textTransform: 'none',
                    fontSize: 14,
                    borderRadius: 20,
                    px: 2,
                    border: '1px solid rgba(255,255,255,0.7)',
                  }}
                >
                  Register
                </Button>
              </>
            )}
          </Box>

          {/* Mobile: hamburger icon */}
          <Box sx={{ display: { xs: 'flex', md: 'none' }, ml: 'auto' }}>
            <IconButton
              color="inherit"
              edge="end"
              onClick={toggleDrawer}
              aria-label="menu"
            >
              <MenuIcon />
            </IconButton>
          </Box>
        </Toolbar>
      </AppBar>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={toggleDrawer}
      >
        {drawer}
      </Drawer>
    </>
  );
}
