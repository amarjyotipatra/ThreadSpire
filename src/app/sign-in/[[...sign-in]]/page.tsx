"use client";

import { SignIn } from "@clerk/nextjs";
import { Box, Typography, Container, Paper } from "@mui/material";
import { BookmarkBorder, Person } from "@mui/icons-material";
import { useSearchParams } from "next/navigation";
import Link from "next/link";

export default function SignInPage() {
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get("redirect_url") || "/";
  const reason = searchParams.get("reason");
  
  let messageHeading = "Sign in to your account";
  let message = "Welcome back to ThreadSpire";
  
  // Custom messages based on where the user came from
  if (reason === "bookmarks") {
    messageHeading = "Sign in to access your Bookmarks";
    message = "Save and organize your favorite threads";
  } else if (reason === "profile") {
    messageHeading = "Sign in to access your Profile";
    message = "View and manage your collections and personal content";
  }

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          display: 'flex', 
          flexDirection: 'column', 
          alignItems: 'center',
          border: '1px solid',
          borderColor: 'divider',
          mb: 4
        }}
      >
        {/* Login Icon Section */}
        <Box 
          sx={{ 
            display: 'flex', 
            gap: 2, 
            justifyContent: 'center', 
            alignItems: 'center',
            mb: 3 
          }}
        >
          {reason === "bookmarks" ? (
            <BookmarkBorder sx={{ fontSize: 38, color: 'primary.main' }} />
          ) : reason === "profile" ? (
            <Person sx={{ fontSize: 38, color: 'primary.main' }} />
          ) : (
            <Box sx={{ 
              width: 50, 
              height: 50, 
              borderRadius: '50%', 
              bgcolor: 'primary.light',
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center'
            }}>
              <Typography variant="h4" color="primary.main">T</Typography>
            </Box>
          )}
        </Box>
        
        {/* Message Section */}
        <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 600, textAlign: 'center' }}>
          {messageHeading}
        </Typography>
        
        <Typography variant="body1" color="text.secondary" sx={{ mb: 4, textAlign: 'center' }}>
          {message}
        </Typography>
        
        {/* Clerk SignIn Component */}
        <SignIn
          appearance={{
            elements: {
              rootBox: { width: '100%' },
              card: { border: 'none', boxShadow: 'none', width: '100%' }
            }
          }} 
          redirectUrl={redirectUrl}
        />
      </Paper>
      
      <Box sx={{ textAlign: 'center' }}>
        <Link href="/" style={{ textDecoration: 'none' }}>
          <Typography color="primary">
            Return to Home
          </Typography>
        </Link>
      </Box>
    </Container>
  );
}