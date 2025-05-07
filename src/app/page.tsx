"use client";

import Link from "next/link";
import { 
  Box, 
  Typography, 
  Button, 
  Container, 
  Card,
  Divider,
  Avatar, 
  IconButton,
  Stack,
  Skeleton,
  useTheme,
  useMediaQuery
} from "@mui/material";
import { 
  FavoriteBorder, 
  ChatBubbleOutline, 
  Repeat, 
  IosShare, 
  Favorite,
  MoreHoriz
} from "@mui/icons-material";
import { useState, useEffect } from "react";

interface Thread {
  id: string;
  title: string;
  segments: any[];
  author: {
    id: string;
    name: string;
    profileImage: string;
  };
  tags: string[];
  createdAt: string;
}

interface User {
  id: string;
  name: string;
  email: string;
  profileImage?: string;
}

export default function Home() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));

  useEffect(() => {
    async function fetchThreads() {
      try {
        const response = await fetch('/api/threads');
        if (response.ok) {
          const data = await response.json();
          setThreads(data);
        }
      } catch (error) {
        console.error('Error fetching threads:', error);
      } finally {
        setIsLoading(false);
      }
    }

    fetchThreads();
  }, []);

  // Fetch user data
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
      }
    }
    
    fetchUserData();
  }, []);
  
  // Format date in Threads app style (e.g., "2h" for 2 hours ago)
  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const seconds = Math.floor((now.getTime() - date.getTime()) / 1000);
    
    let interval = seconds / 31536000;
    if (interval > 1) return Math.floor(interval) + "y";
    
    interval = seconds / 2592000;
    if (interval > 1) return Math.floor(interval) + "m";
    
    interval = seconds / 86400;
    if (interval > 1) return Math.floor(interval) + "d";
    
    interval = seconds / 3600;
    if (interval > 1) return Math.floor(interval) + "h";
    
    interval = seconds / 60;
    if (interval > 1) return Math.floor(interval) + "m";
    
    return Math.floor(seconds) + "s";
  };

  // Threads-style view for mobile
  if (isMobile) {
    return (
      <Box sx={{ pb: 7, pt: 7 }}>
        {!user && (
          <Box sx={{ p: 2, textAlign: 'center', mb: 2 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              component={Link}
              href="/sign-in"
            >
              Sign in
            </Button>
          </Box>
        )}
        
        {isLoading ? (
          // Skeleton loading state
          Array.from({ length: 3 }).map((_, index) => (
            <Box key={index} sx={{ p: 2, mb: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                <Skeleton variant="circular" width={40} height={40} />
                <Box sx={{ ml: 1.5 }}>
                  <Skeleton width={120} height={20} />
                  <Skeleton width={80} height={16} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" height={80} sx={{ mb: 1.5, borderRadius: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width={120} height={30} />
                <Skeleton width={80} height={30} />
              </Box>
            </Box>
          ))
        ) : threads.length === 0 ? (
          <Box sx={{ p: 4, textAlign: 'center' }}>
            <Typography color="text.secondary">
              No threads available yet.
            </Typography>
            {user && (
              <Button
                component={Link}
                href="/create"
                sx={{ mt: 2 }}
              >
                Create the first thread
              </Button>
            )}
          </Box>
        ) : (
          // Thread list - Threads style
          threads.map((thread) => {
            // Get preview from first segment
            const firstSegment = thread.segments?.find((s) => s.order === 0);
            const previewText = firstSegment 
              ? firstSegment.content.replace(/<[^>]*>/g, '')
              : 'No content available';

            return (
              <Box 
                key={thread.id} 
                sx={{ 
                  pt: 2, 
                  pb: 2, 
                  borderBottom: `1px solid ${theme.palette.divider}` 
                }}
              >
                {/* Thread header */}
                <Box sx={{ px: 2, display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar 
                    src={thread.author?.profileImage} 
                    alt={thread.author?.name}
                    sx={{ 
                      width: 40, 
                      height: 40,
                      mr: 1.5
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    {/* Author and timestamp */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between' 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle2" component="span" sx={{ fontWeight: 600 }}>
                          {thread.author?.name || 'Anonymous'}
                        </Typography>
                        <Box 
                          component="span" 
                          sx={{ 
                            mx: 0.5, 
                            fontSize: '10px', 
                            color: theme.palette.text.secondary 
                          }}
                        >
                          •
                        </Box>
                        <Typography variant="caption" color="text.secondary">
                          {formatTimeAgo(thread.createdAt)}
                        </Typography>
                      </Box>
                      <IconButton size="small">
                        <MoreHoriz fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Thread title as main content */}
                    <Typography variant="body1" sx={{ fontWeight: 400, mb: 1, mt: 0.5 }}>
                      {thread.title}
                    </Typography>
                    
                    {/* Thread content preview */}
                    <Typography 
                      variant="body2" 
                      color="text.secondary" 
                      sx={{ 
                        mb: 2,
                        display: '-webkit-box',
                        WebkitLineClamp: 3,
                        WebkitBoxOrient: 'vertical',
                        overflow: 'hidden'
                      }}
                    >
                      {previewText}
                    </Typography>
                    
                    {/* Actions bar */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        component={Link} 
                        href={`/thread/${thread.id}`}
                      >
                        <FavoriteBorder fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        component={Link} 
                        href={`/thread/${thread.id}`}
                      >
                        <ChatBubbleOutline fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        component={Link} 
                        href={`/thread/${thread.id}`}
                      >
                        <Repeat fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        component={Link} 
                        href={`/thread/${thread.id}`}
                      >
                        <IosShare fontSize="small" />
                      </IconButton>
                    </Box>
                    
                    {/* Thread details/stats */}
                    <Typography variant="caption" color="text.secondary" sx={{ mt: 1, display: 'block' }}>
                      {(Math.floor(Math.random() * 50) + 1)} replies • {(Math.floor(Math.random() * 100) + 1)} likes
                    </Typography>
                  </Box>
                </Box>
              </Box>
            );
          })
        )}
      </Box>
    );
  }
  
  // Desktop view - similar but with more width constraints
  return (
    <Container maxWidth="md" sx={{ py: 4 }}>
      {!user && (
        <Box sx={{ mb: 5, textAlign: 'center' }}>
          <Typography variant="h4" component="h1" gutterBottom>
            Welcome to ThreadSpire
          </Typography>
          <Typography variant="subtitle1" color="text.secondary" sx={{ mb: 3 }}>
            A minimalist platform for sharing valuable threads.
          </Typography>
          
          <Button 
            variant="contained" 
            color="primary" 
            size="large"
            component={Link}
            href="/sign-in"
          >
            Sign in to create threads
          </Button>
        </Box>
      )}
      
      {isLoading ? (
        // Skeleton loading state for desktop
        Array.from({ length: 3 }).map((_, index) => (
          <Card key={index} variant="outlined" sx={{ mb: 3, overflow: 'visible', borderRadius: 2 }}>
            <Box sx={{ p: 3 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                <Skeleton variant="circular" width={48} height={48} />
                <Box sx={{ ml: 2 }}>
                  <Skeleton width={150} height={24} />
                  <Skeleton width={100} height={18} />
                </Box>
              </Box>
              <Skeleton variant="rectangular" height={100} sx={{ mb: 2, borderRadius: 1 }} />
              <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                <Skeleton width={200} height={30} />
                <Skeleton width={100} height={30} />
              </Box>
            </Box>
          </Card>
        ))
      ) : threads.length === 0 ? (
        <Card variant="outlined" sx={{ p: 6, textAlign: 'center', borderRadius: 2 }}>
          <Typography color="text.secondary" paragraph>
            No threads available yet.
          </Typography>
          {user && (
            <Button
              component={Link}
              href="/create"
              color="primary"
              variant="outlined"
            >
              Create the first thread
            </Button>
          )}
        </Card>
      ) : (
        // Thread list for desktop - similar layout but with cards
        threads.map((thread) => {
          // Get preview from first segment
          const firstSegment = thread.segments?.find((s) => s.order === 0);
          const previewText = firstSegment 
            ? firstSegment.content.replace(/<[^>]*>/g, '')
            : 'No content available';

          return (
            <Card
              key={thread.id}
              variant="outlined"
              sx={{ 
                mb: 3, 
                overflow: 'visible', 
                borderRadius: 2,
                '&:hover': {
                  borderColor: theme.palette.mode === 'dark' ? 'rgba(255,255,255,0.2)' : 'rgba(0,0,0,0.2)'
                }
              }}
            >
              <Box sx={{ p: 3 }}>
                {/* Thread header */}
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <Avatar 
                    src={thread.author?.profileImage} 
                    alt={thread.author?.name}
                    sx={{ 
                      width: 48, 
                      height: 48,
                      mr: 2
                    }}
                  />
                  <Box sx={{ flex: 1 }}>
                    {/* Author and timestamp */}
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'space-between' 
                    }}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Typography variant="subtitle1" component="span" sx={{ fontWeight: 600 }}>
                          {thread.author?.name || 'Anonymous'}
                        </Typography>
                        <Box 
                          component="span" 
                          sx={{ 
                            mx: 0.7, 
                            fontSize: '10px', 
                            color: theme.palette.text.secondary 
                          }}
                        >
                          •
                        </Box>
                        <Typography variant="body2" color="text.secondary">
                          {formatTimeAgo(thread.createdAt)}
                        </Typography>
                      </Box>
                      <IconButton>
                        <MoreHoriz />
                      </IconButton>
                    </Box>
                    
                    {/* Thread title as main content - link to thread detail */}
                    <Link href={`/thread/${thread.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                      <Typography variant="h6" sx={{ fontWeight: 600, my: 1 }}>
                        {thread.title}
                      </Typography>
                      
                      {/* Thread content preview */}
                      <Typography 
                        variant="body1" 
                        color="text.secondary" 
                        sx={{ 
                          mb: 2.5,
                          display: '-webkit-box',
                          WebkitLineClamp: 3,
                          WebkitBoxOrient: 'vertical',
                          overflow: 'hidden'
                        }}
                      >
                        {previewText}
                      </Typography>
                    </Link>
                    
                    {/* Actions bar */}
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="medium" 
                        component={Link} 
                        href={`/thread/${thread.id}`}
                      >
                        <FavoriteBorder />
                      </IconButton>
                      <IconButton 
                        size="medium" 
                        component={Link} 
                        href={`/thread/${thread.id}`}
                      >
                        <ChatBubbleOutline />
                      </IconButton>
                      <IconButton 
                        size="medium" 
                        component={Link} 
                        href={`/thread/${thread.id}`}
                      >
                        <Repeat />
                      </IconButton>
                      <IconButton 
                        size="medium" 
                        component={Link} 
                        href={`/thread/${thread.id}`}
                      >
                        <IosShare />
                      </IconButton>
                    </Box>
                    
                    {/* Thread details/stats */}
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                      {(Math.floor(Math.random() * 50) + 1)} replies • {(Math.floor(Math.random() * 100) + 1)} likes
                    </Typography>
                  </Box>
                </Box>
              </Box>
            </Card>
          );
        })
      )}
    </Container>
  );
}