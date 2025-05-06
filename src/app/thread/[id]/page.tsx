"use client";

import { useEffect, useState } from 'react';
import { notFound, useParams } from 'next/navigation';
import Link from 'next/link';
import { 
  Box, 
  Typography,
  Avatar,
  Divider,
  IconButton,
  Stack,
  Chip,
  Container,
  Card,
  useTheme,
  useMediaQuery,
  Skeleton,
  Button
} from '@mui/material';
import { 
  ArrowBack, 
  FavoriteBorder, 
  ChatBubbleOutline, 
  Repeat, 
  IosShare, 
  Favorite,
  MoreHoriz
} from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';

interface Reaction {
  id: string;
  type: string;
  userId: string;
}

interface Segment {
  id: string;
  content: string;
  order: number;
  reactions: Reaction[];
}

interface Author {
  id: string;
  name: string;
  profileImage?: string;
}

interface Thread {
  id: string;
  title: string;
  segments: Segment[];
  author?: Author;
  originalThread?: {
    id: string;
    title: string;
    author?: {
      id: string;
      name: string;
    };
  };
  tags: string[];
  createdAt: string;
  userId: string;
}

// Function to format date in Threads-style (2h, 3d ago format)
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

export default function ThreadPage() {
  const [thread, setThread] = useState<Thread | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { id } = useParams() as { id: string };
  const { user, isSignedIn } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Load thread data
  useEffect(() => {
    const fetchThreadData = async () => {
      try {
        // In a real app, this would be an API call to get the thread data
        const response = await fetch(`/api/threads/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch thread');
        }
        
        const data = await response.json();
        setThread(data);
      } catch (error) {
        console.error('Error fetching thread:', error);
        // Would implement a proper error state UI in a real app
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThreadData();
  }, [id]);
  
  if (isLoading) {
    return <ThreadDetailSkeleton isMobile={isMobile} />;
  }
  
  if (!thread) {
    return notFound();
  }
  
  // Count reactions per segment
  const reactionCounts = thread.segments.map((segment) => {
    const counts: Record<string, number> = {};
    segment.reactions.forEach((reaction) => {
      counts[reaction.type] = (counts[reaction.type] || 0) + 1;
    });
    return counts;
  });

  // Check if current user has reacted to each segment
  const userReactions = user
    ? thread.segments.map((segment) => 
        segment.reactions.find((r) => r.userId === user.id)?.type || null
      )
    : [];
  
  const containerMaxWidth = isMobile ? 'sm' : 'md';
  const contentPadding = isMobile ? { px: 2, py: 2 } : { px: 3, py: 3 };
  
  return (
    <Container maxWidth={containerMaxWidth} sx={{ pt: isMobile ? 7 : 4, pb: isMobile ? 8 : 4 }}>
      {/* Mobile header with back button */}
      {isMobile && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          position: 'sticky', 
          top: 0, 
          bgcolor: theme.palette.background.default,
          zIndex: 10,
          py: 1.5
        }}>
          <IconButton component={Link} href="/" edge="start" color="inherit" aria-label="back">
            <ArrowBack />
          </IconButton>
          <Typography variant="subtitle1" sx={{ ml: 2, fontWeight: 600 }}>Thread</Typography>
        </Box>
      )}
      
      {/* Thread header */}
      <Box sx={{ ...contentPadding, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Avatar 
            src={thread.author?.profileImage} 
            alt={thread.author?.name}
            sx={{ width: 48, height: 48, mr: 2 }}
          />
          <Box sx={{ flex: 1 }}>
            {/* Author info */}
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              justifyContent: 'space-between',
              mb: 0.5
            }}>
              <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                {thread.author?.name || 'Anonymous'}
              </Typography>
              <IconButton size="small">
                <MoreHoriz />
              </IconButton>
            </Box>
            
            {/* Creation time */}
            <Typography variant="body2" color="text.secondary">
              {formatTimeAgo(thread.createdAt)}
            </Typography>
          </Box>
        </Box>
        
        {/* Thread title */}
        <Typography variant="h5" sx={{ fontWeight: 700, mb: 2 }}>
          {thread.title}
        </Typography>
        
        {/* Tags */}
        {thread.tags?.length > 0 && (
          <Stack direction="row" spacing={1} sx={{ mb: 2, flexWrap: 'wrap', gap: 1 }}>
            {thread.tags.map((tag: string) => (
              <Chip key={tag} label={tag} size="small" />
            ))}
          </Stack>
        )}
        
        {/* Original thread reference (if this is a fork) */}
        {thread.originalThread && (
          <Card variant="outlined" sx={{ p: 2, mb: 2, borderStyle: 'dashed' }}>
            <Typography variant="body2" color="text.secondary">
              Forked from{" "}
              <Link 
                href={`/thread/${thread.originalThread.id}`}
                style={{ color: theme.palette.secondary.main }}
              >
                {thread.originalThread.title}
              </Link>{" "}
              by {thread.originalThread.author?.name}
            </Typography>
          </Card>
        )}
      </Box>
      
      <Divider />
      
      {/* Thread segments */}
      {thread.segments.map((segment, index) => (
        <Box key={segment.id} sx={{ ...contentPadding, borderBottom: `1px solid ${theme.palette.divider}` }}>
          <Box 
            sx={{ mb: 3 }}
            dangerouslySetInnerHTML={{ __html: segment.content }}
          />
          
          {/* Reaction buttons */}
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton 
              size={isMobile ? "small" : "medium"}
              color={userReactions[index] === '❤️' ? "secondary" : "default"}
            >
              {userReactions[index] === '❤️' ? <Favorite color="secondary" /> : <FavoriteBorder />}
            </IconButton>
            <IconButton size={isMobile ? "small" : "medium"}>
              <ChatBubbleOutline />
            </IconButton>
            <IconButton size={isMobile ? "small" : "medium"}>
              <Repeat />
            </IconButton>
            <IconButton size={isMobile ? "small" : "medium"}>
              <IosShare />
            </IconButton>
          </Box>
          
          {/* Reaction stats */}
          <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
            {Object.values(reactionCounts[index] || {}).reduce((a, b) => a + b, 0) || 0} likes
          </Typography>
        </Box>
      ))}
      
      {/* Related threads section */}
      <Box sx={{ ...contentPadding, mt: 4 }}>
        <Typography variant="h6" sx={{ mb: 2, fontWeight: 600 }}>
          You might like
        </Typography>
        
        {/* This would be populated with actual suggested threads */}
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
          <RelatedThreadCard />
          <RelatedThreadCard />
        </Box>
      </Box>
    </Container>
  );
}

// Skeleton component for loading state
function ThreadDetailSkeleton({ isMobile }: { isMobile: boolean }) {
  const theme = useTheme();
  const containerMaxWidth = isMobile ? 'sm' : 'md';
  const contentPadding = isMobile ? { px: 2, py: 2 } : { px: 3, py: 3 };
  
  return (
    <Container maxWidth={containerMaxWidth} sx={{ pt: isMobile ? 7 : 4, pb: isMobile ? 8 : 4 }}>
      {isMobile && (
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center',
          py: 1.5
        }}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" sx={{ ml: 2, width: 120 }} />
        </Box>
      )}
      
      <Box sx={{ ...contentPadding, mb: 2 }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', mb: 2 }}>
          <Skeleton variant="circular" width={48} height={48} sx={{ mr: 2 }} />
          <Box sx={{ flex: 1 }}>
            <Skeleton variant="text" sx={{ width: '60%' }} />
            <Skeleton variant="text" sx={{ width: '30%' }} />
          </Box>
        </Box>
        
        <Skeleton variant="text" sx={{ width: '90%', height: 30, mb: 1 }} />
        <Skeleton variant="text" sx={{ width: '70%', height: 30, mb: 2 }} />
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Skeleton variant="rounded" width={60} height={24} />
          <Skeleton variant="rounded" width={60} height={24} />
        </Box>
      </Box>
      
      <Divider />
      
      <Box sx={{ ...contentPadding }}>
        <Skeleton variant="rectangular" height={120} sx={{ mb: 2 }} />
        <Skeleton variant="rectangular" height={80} sx={{ mb: 2 }} />
        
        <Box sx={{ display: 'flex', gap: 2 }}>
          <Skeleton variant="circular" width={30} height={30} />
          <Skeleton variant="circular" width={30} height={30} />
          <Skeleton variant="circular" width={30} height={30} />
          <Skeleton variant="circular" width={30} height={30} />
        </Box>
      </Box>
    </Container>
  );
}

// Mock component for related threads
function RelatedThreadCard() {
  const theme = useTheme();
  
  return (
    <Box sx={{ 
      display: 'flex', 
      p: 2, 
      borderRadius: 2, 
      border: `1px solid ${theme.palette.divider}` 
    }}>
      <Avatar sx={{ width: 40, height: 40, mr: 2 }} />
      <Box>
        <Typography variant="subtitle2" sx={{ fontWeight: 600 }}>
          Username
        </Typography>
        <Typography variant="body2" color="text.secondary" sx={{
          overflow: 'hidden',
          textOverflow: 'ellipsis',
          display: '-webkit-box',
          WebkitLineClamp: 2,
          WebkitBoxOrient: 'vertical'
        }}>
          This is a related thread that might be interesting based on the current thread content.
        </Typography>
      </Box>
    </Box>
  );
}