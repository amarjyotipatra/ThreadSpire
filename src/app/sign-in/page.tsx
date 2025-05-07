"use client";

import { useEffect, useState, Suspense } from "react";
import { Box, Typography, Container, Paper, TextField, Button, CircularProgress, Alert } from "@mui/material";
import { BookmarkBorder, Person } from "@mui/icons-material";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";

// Separate component that uses useSearchParams
function SignInForm() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect_url') || '/';
  const reason = searchParams.get('reason');
  
  // Customize messaging based on where the user came from
  let messageHeading = "Sign in to ThreadSpire";
  let messageSubtext = "Enter your details below to continue";

  // Custom messages based on where the user came from
  if (reason === "bookmarks") {
    messageHeading = "Sign in to access your Bookmarks";
    messageSubtext = "Save and organize your favorite threads";
  } else if (reason === "profile") {
    messageHeading = "Sign in to access your Profile";
    messageSubtext = "View and manage your collections and personal content";
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Failed to sign in');
      }

      // Redirect to the intended page or homepage
      router.push(redirectUrl);
      router.refresh(); // Refresh the page to update authentication state
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Container maxWidth="sm" sx={{ py: 8 }}>
      <Paper 
        elevation={0} 
        sx={{ 
          p: 4, 
          mb: 3, 
          borderRadius: 2,
          boxShadow: (theme) => theme.palette.mode === 'dark' 
            ? '0 4px 20px rgba(0,0,0,0.4)' 
            : '0 4px 20px rgba(0,0,0,0.1)'
        }}
      >
        {/* Logo/Brand or Icon Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          {/* Show different icons based on reason */}
          {reason === "bookmarks" ? (
            <BookmarkBorder sx={{ fontSize: 38, color: "primary.main", mb: 2 }} />
          ) : reason === "profile" ? (
            <Person sx={{ fontSize: 38, color: "primary.main", mb: 2 }} />
          ) : (
            <Box
              sx={{
                width: 50,
                height: 50,
                borderRadius: "50%",
                bgcolor: "primary.light",
                display: "flex",
                justifyContent: "center",
                alignItems: "center",
                mb: 2,
                mx: "auto"
              }}
            >
              <Typography variant="h4" color="primary.main">
                T
              </Typography>
            </Box>
          )}
          
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            {messageHeading}
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            {messageSubtext}
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Email"
            variant="outlined"
            type="email"
            fullWidth
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />
          
          <TextField
            label="Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            disabled={isLoading}
          />
          
          <Button
            type="submit"
            variant="contained"
            color="primary"
            size="large"
            fullWidth
            sx={{ mt: 3, mb: 2 }}
            disabled={isLoading}
          >
            {isLoading ? <CircularProgress size={24} /> : 'Sign In'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Don't have an account?{' '}
              <Link href="/sign-up" style={{ textDecoration: 'none', color: 'primary' }}>
                Sign up
              </Link>
            </Typography>
          </Box>
        </form>
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

// Main component with Suspense boundary
export default function SignInPage() {
  return (
    <Suspense fallback={
      <Container maxWidth="sm" sx={{ py: 8, textAlign: 'center' }}>
        <CircularProgress />
        <Typography mt={2}>Loading sign-in page...</Typography>
      </Container>
    }>
      <SignInForm />
    </Suspense>
  );
}