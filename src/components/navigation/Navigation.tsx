"use client";

import React from 'react'; 
import { UserButton, ClerkLoaded, useAuth, SignInButton } from "@clerk/nextjs";
import { Home, AddBox, Search, FavoriteBorder, Person } from "@mui/icons-material";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider
} from "@mui/material";
import { ThemeToggle } from "../ui/ThemeToggle";
import { useState } from "react";

const Navigation = () => {
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isSignedIn } = useAuth();
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };
  
  const navItems = [
    {
      label: "Home",
      href: "/",
      icon: Home,
    },
    {
      label: "Search",
      href: "/explore",
      icon: Search,
    },
    {
      label: "Create",
      href: "/create",
      icon: AddBox,
    },
    {
      label: "Bookmarks",
      href: "/bookmarks",
      icon: FavoriteBorder,
    },
    {
      label: "Profile",
      href: "/collections",
      icon: Person,
    },
  ];

  // Find active nav item index for bottom navigation
  const activeNavIndex = navItems.findIndex(item => item.href === pathname) !== -1 
    ? navItems.findIndex(item => item.href === pathname) 
    : 0;
  
  const drawer = (
    <>
      <Box sx={{ p: 2 }}>
        <Typography variant="h6" sx={{ fontWeight: 'bold' }}>
          ThreadSpire
        </Typography>
      </Box>
      
      <List sx={{ flexGrow: 1 }}>
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const IconComponent = item.icon;
          
          return (
            <ListItem key={item.href} disablePadding>
              <ListItemButton 
                component={Link} 
                href={item.href}
                selected={isActive}
              >
                <ListItemIcon>
                  <IconComponent />
                </ListItemIcon>
                <ListItemText primary={item.label} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
      
      <Divider />
      
      <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
        <Box sx={{ display: 'flex', justifyContent: 'flex-start' }}>
          <ThemeToggle />
        </Box>
        
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          {isSignedIn ? (
            <>
              <ClerkLoaded>
                <UserButton afterSignOutUrl="/" />
              </ClerkLoaded>
              <Typography variant="body2">Account</Typography>
            </>
          ) : (
            <SignInButton mode="modal">
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, cursor: 'pointer' }}>
                <Avatar sx={{ width: 32, height: 32 }} />
                <Typography variant="body2">Account</Typography>
              </Box>
            </SignInButton>
          )}
        </Box>
      </Box>
    </>
  );

  if (isMobile) {
    // Mobile view with bottom navigation and top app bar
    return (
      <>
        <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Toolbar>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, fontWeight: 'bold' }}>
              ThreadSpire
            </Typography>
            <ThemeToggle />
          </Toolbar>
        </AppBar>
        
        <Box 
          component="nav" 
          sx={{ 
            width: { sm: 240 }, 
            flexShrink: { sm: 0 } 
          }}
        >
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{ keepMounted: true }}
            sx={{
              '& .MuiDrawer-paper': { 
                width: 240,
                boxSizing: 'border-box' 
              },
            }}
          >
            {drawer}
          </Drawer>
        </Box>
        
        <Paper 
          sx={{ 
            position: 'fixed', 
            bottom: 0, 
            left: 0, 
            right: 0, 
            zIndex: theme.zIndex.appBar 
          }} 
          elevation={3}
        >
          <BottomNavigation
            showLabels={false}
            value={activeNavIndex}
          >
            {navItems.map((item) => (
              <BottomNavigationAction 
                key={item.href}
                component={Link} 
                href={item.href}
                icon={<item.icon />} 
              />
            ))}
          </BottomNavigation>
        </Paper>
      </>
    );
  }

  // Tablet/Desktop view with side navigation
  return (
    <Drawer
      variant="permanent"
      sx={{
        display: { xs: 'none', sm: 'block' },
        width: 240,
        flexShrink: 0,
        '& .MuiDrawer-paper': {
          width: 240,
          boxSizing: 'border-box',
        },
      }}
    >
      {drawer}
    </Drawer>
  );
};

export default React.memo(Navigation); // Wrapped Navigation with React.memo