import { ClerkProvider } from '@clerk/nextjs';
import { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Navigation from '@/components/navigation/Navigation';
import { MuiThemeProvider } from '@/components/providers/mui-theme-provider';
import { Box } from '@mui/material';
import ErrorBoundary from '@/components/ui/ErrorBoundary'; // Import ErrorBoundary
// Import our database initialization - this will ensure tables are created
import '../../lib/init-db';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'ThreadSpire - Community Wisdom Threads',
  description: 'A platform for sharing thoughtful wisdom in thread format',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ClerkProvider>
      <html lang="en">
        <body className={inter.className}>
          <MuiThemeProvider defaultTheme="system">
              <Navigation />
              <Box
                component="main"
                sx={{ 
                  flexGrow: 1, 
                  overflowY: 'auto',
                  paddingBottom: '56px', // Space for bottom navigation on mobile
                  paddingTop: '56px',    // Space for top app bar on mobile
                  marginLeft: { xs: 0, sm: '240px' } // Space for sidebar on desktop
                }}
              >
                <ErrorBoundary>
                  {children}
                </ErrorBoundary>
              </Box>
          </MuiThemeProvider>
        </body>
      </html>
    </ClerkProvider>
  );
}