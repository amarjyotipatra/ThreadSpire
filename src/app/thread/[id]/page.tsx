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
} from '@mui/material';
import { 
  ArrowBack, 
  ChatBubbleOutline, 
  Repeat, 
  IosShare, 
  MoreHoriz
} from '@mui/icons-material';
import { useUser } from '@clerk/nextjs';
import ReactionSection from '@/components/thread/ReactionSection';
import ErrorAlert from '@/components/ui/ErrorAlert';
import { useErrorHandler } from '@/hooks/useErrorHandler';
import { ErrorType } from '../../../../lib/errors';


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
  const [reactionStates, setReactionStates] = useState<Array<{userReaction: string | null, counts: Record<string, number>}>>([]);
  const { error, setError, clearError } = useErrorHandler();
  const { id } = useParams() as { id: string };
  const { user, isSignedIn } = useUser();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  
  // Load thread data
  useEffect(() => {
    const fetchThreadData = async () => {
      try {
        setIsLoading(true);
        clearError();
        
        // Clean the ID by removing any trailing characters like ":1"
        const cleanId = id.split(':')[0];
        
        // Use the clean ID when making the API request
        const response = await fetch(`/api/threads/${cleanId}`, {
          cache: 'no-store', // Ensure we get fresh data
          headers: {
            'Content-Type': 'application/json',
          }
        });
        
        if (!response.ok) {
          if (response.status === 404) {
            throw new Error('Thread not found', { cause: ErrorType.NOT_FOUND_ERROR });
          }
          const errorData = await response.json().catch(() => ({}));
          throw new Error(errorData.error?.message || `Failed to fetch thread: ${response.status}`, {
            cause: errorData.error?.type || ErrorType.NETWORK_ERROR
          });
        }
        
        const data = await response.json();
        setThread(data);
        
        // Initialize reaction states
        const initialReactionStates = data.segments.map((segment: Segment) => {
          const counts: Record<string, number> = {};
          segment.reactions.forEach((reaction: Reaction) => {
            counts[reaction.type] = (counts[reaction.type] || 0) + 1;
          });
          
          const userReaction = user 
            ? segment.reactions.find((r: Reaction) => r.userId === user.id)?.type || null 
            : null;
            
          return { userReaction, counts };
        });
        
        setReactionStates(initialReactionStates);
      } catch (error) {
        console.error('Error fetching thread:', error);
        const errorMessage = error instanceof Error ? error.message : 'Failed to load thread. Please try again later.';
        const errorType = error instanceof Error && error.cause ? error.cause as ErrorType : ErrorType.UNKNOWN_ERROR;
        setError(errorMessage, errorType as ErrorType | undefined);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchThreadData();
  }, [id, user, setError, clearError]);
  
  if (isLoading) {
    return <ThreadDetailSkeleton isMobile={isMobile} />;
  }
  
  if (error && !thread) {
    return (
      <Container maxWidth={isMobile ? 'sm' : 'md'} sx={{ pt: isMobile ? 7 : 4, pb: isMobile ? 8 : 4 }}>
        <Box sx={{ py: 4 }}>
          <ErrorAlert 
            message={error.message} 
            type={error.type}
            onClose={clearError}
            autoHideDuration={null}
          />
          <Box sx={{ textAlign: 'center', mt: 3 }}>
            <Link href="/" style={{ color: theme.palette.primary.main }}>
              Return to home
            </Link>
          </Box>
        </Box>
      </Container>
    );
  }
  
  if (!thread) {
    return notFound();
  }
  
  const containerMaxWidth = isMobile ? 'sm' : 'md';
  const contentPadding = isMobile ? { px: 2, py: 2 } : { px: 3, py: 3 };
  
  return (
    <Container maxWidth={containerMaxWidth} sx={{ pt: isMobile ? 7 : 4, pb: isMobile ? 8 : 4 }}>
      {/* Display any non-fatal errors */}
      {error && (
        <Box sx={{ mb: 2 }}>
          <ErrorAlert
            message={error.message}
            type={error.type}
            onClose={clearError}
            severity="warning"
          />
        </Box>
      )}
      
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
      {thread.segments.map((segment, index) => {
        const reactionState = reactionStates[index] || { userReaction: null, counts: {} };
        const totalLikes = Object.values(reactionState.counts).reduce((a, b) => a + b, 0);
        
        return (
          <Box key={segment.id} sx={{ ...contentPadding, borderBottom: `1px solid ${theme.palette.divider}` }}>
            <Box 
              sx={{ mb: 3 }}
              dangerouslySetInnerHTML={{ __html: segment.content }}
            />
            
            {/* Replace the basic reaction buttons with ReactionSection component */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <ReactionSection
                  segmentId={segment.id}
                  reactionCounts={reactionState.counts}
                  userReaction={reactionState.userReaction}
                  isAuthenticated={!!isSignedIn}
                />
              
              <Box sx={{ display: 'flex', gap: 1 }}>
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
            </Box>
            
            {/* Reaction stats */}
            {totalLikes > 0 && (
              <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                {totalLikes} {totalLikes === 1 ? 'reaction' : 'reactions'}
              </Typography>
            )}
          </Box>
        );
      })}
      
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
      {/* Already using Avatar here, ensure sx prop is used for sizing if needed */}
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
