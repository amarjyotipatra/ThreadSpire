"use client";

import React, { useState, useEffect } from 'react'; 
import { Home, AddBox, Search, FavoriteBorder, Person, ExitToApp } from "@mui/icons-material";
import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { 
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  Box,
  AppBar,
  Toolbar,
  Typography,
  Avatar,
  useMediaQuery,
  useTheme,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Button
} from "@mui/material";
import { ThemeToggle } from "../ui/ThemeToggle";

// Custom type for user data
interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

const Navigation = () => {
  const pathname = usePathname();
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  
  // Fetch user data on client side
  useEffect(() => {
    async function fetchUserData() {
      try {
        const res = await fetch('/api/auth/me');
        if (res.ok) {
          const userData = await res.json();
          setUser(userData.user);
        } else {
          setUser(null);
        }
      } catch (error) {
        console.error('Failed to fetch user data:', error);
        setUser(null);
      } finally {
        setLoading(false);
      }
    }
    
    fetchUserData();
  }, [pathname]); // Re-fetch when path changes to keep auth state updated
  
  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleLogout = async () => {
    try {
      await fetch('/api/auth/logout', { 
        method: 'POST' 
      });
      // Clear client-side user state
      setUser(null);
      // Redirect to home page
      router.push('/');
      router.refresh();
    } catch (error) {
      console.error('Failed to logout:', error);
    }
  };
  
  // Create base navigation items that are always visible
  const baseNavItems = [
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
  ];
  
  // Add authenticated-only items
  const authNavItems = [
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
  
  // Combine base items with auth items if user is authenticated
  const navItems = user 
    ? [...baseNavItems, ...authNavItems]
    : baseNavItems;

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
          {user ? (
            <>
              <Avatar 
                sx={{ width: 32, height: 32 }}
                src={user.profileImage} 
                alt={user.name}
              >
                {user.name?.charAt(0)}
              </Avatar>
              <Typography variant="body2" sx={{ flexGrow: 1 }}>
                {user.name}
              </Typography>
              <Button 
                startIcon={<ExitToApp />}
                onClick={handleLogout}
                size="small"
                color="inherit"
              >
                Logout
              </Button>
            </>
          ) : (
            <Button 
              component={Link}
              href="/sign-in"
              variant="outlined"
              size="small"
              fullWidth
            >
              Sign In
            </Button>
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

export default React.memo(Navigation);