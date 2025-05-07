"use client";

import { useState } from "react";
import { Box, Typography, Container, Paper, TextField, Button, CircularProgress, Alert } from "@mui/material";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function SignUpPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    
    // Validate passwords match
    if (password !== confirmPassword) {
      setError("Passwords don't match");
      return;
    }
    
    setIsLoading(true);

    try {
      // Set a timeout for the fetch request to prevent UI hanging
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // 10 second timeout

      const response = await fetch('/api/auth/register', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ name, email, password }),
        signal: controller.signal
      });

      clearTimeout(timeoutId); // Clear the timeout since request completed

      // Try to parse the response as JSON
      let data;
      try {
        data = await response.json();
      } catch (parseError) {
        console.error('Failed to parse response:', parseError);
        throw new Error('Server returned an invalid response. Please try again.');
      }

      if (!response.ok) {
        throw new Error(data.message || data.error || 'Failed to sign up');
      }

      // Registration successful - show success message briefly before redirecting
      setError(null);
      
      // Redirect to the sign-in page after successful registration with a small delay
      setTimeout(() => {
        router.push('/sign-in');
        router.refresh(); // Refresh the page to update authentication state
      }, 1000);
      
    } catch (err) {
      if (err instanceof Error) {
        if (err.name === 'AbortError') {
          setError('Registration request timed out. Please try again.');
        } else {
          setError(err.message || 'An unexpected error occurred');
        }
      } else {
        setError('An unexpected error occurred');
      }
      console.error('Registration error:', err);
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
        {/* Logo/Brand Section */}
        <Box sx={{ mb: 4, textAlign: 'center' }}>
          <Typography variant="h5" component="h1" gutterBottom sx={{ fontWeight: 700 }}>
            Join ThreadSpire
          </Typography>
          
          <Typography variant="body1" color="text.secondary">
            Create your account to start sharing threads
          </Typography>
        </Box>
        
        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}
        
        <form onSubmit={handleSubmit}>
          <TextField
            label="Name"
            variant="outlined"
            fullWidth
            margin="normal"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            disabled={isLoading}
          />
          
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
          
          <TextField
            label="Confirm Password"
            variant="outlined"
            type="password"
            fullWidth
            margin="normal"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            required
            disabled={isLoading}
            error={password !== confirmPassword && confirmPassword.length > 0}
            helperText={password !== confirmPassword && confirmPassword.length > 0 ? "Passwords don't match" : ""}
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
            {isLoading ? <CircularProgress size={24} /> : 'Sign Up'}
          </Button>
          
          <Box sx={{ textAlign: 'center', mt: 2 }}>
            <Typography variant="body2">
              Already have an account?{' '}
              <Link href="/sign-in" style={{ textDecoration: 'none', color: 'primary' }}>
                Sign in
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