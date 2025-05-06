"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";
import { 
  Box, 
  Typography,
  TextField,
  Button,
  Container,
  Paper,
  Chip,
  Stack,
  IconButton,
  InputAdornment,
  Divider,
  useMediaQuery,
  useTheme,
  Card,
  CircularProgress,
  Snackbar,
  Alert,
  AppBar,
  Toolbar
} from "@mui/material";
import { 
  Add as AddIcon, 
  Close as CloseIcon,
  ArrowBack as ArrowBackIcon,
  Image as ImageIcon,
  FormatBold as FormatBoldIcon,
  FormatItalic as FormatItalicIcon,
  FormatListBulleted as FormatListBulletedIcon,
  FormatListNumbered as FormatListNumberedIcon
} from '@mui/icons-material';
import Link from "next/link";

export default function CreateThread() {
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [segments, setSegments] = useState<{id: string, content: string}[]>([
    { id: "1", content: "" }
  ]);
  const [activeSegment, setActiveSegment] = useState("1");
  const [inputTag, setInputTag] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");
  
  const editor = useEditor({
    extensions: [StarterKit],
    content: segments.find(seg => seg.id === activeSegment)?.content || "",
    onUpdate: ({ editor }) => {
      const html = editor.getHTML();
      setSegments(prev => 
        prev.map(seg => 
          seg.id === activeSegment ? { ...seg, content: html } : seg
        )
      );
    },
  });

  // Sync editor content when active segment changes
  useEffect(() => {
    const segment = segments.find(seg => seg.id === activeSegment);
    if (editor && segment) {
      editor.commands.setContent(segment.content);
    }
  }, [activeSegment, editor]);

  // Add a new segment to the thread
  const addSegment = () => {
    const newId = String(segments.length + 1);
    setSegments([...segments, { id: newId, content: "" }]);
    setActiveSegment(newId);
  };

  // Switch between segments
  const switchToSegment = (id: string) => {
    setActiveSegment(id);
  };

  // Add a tag to the thread
  const addTag = () => {
    if (!inputTag || tags.includes(inputTag)) return;
    setTags([...tags, inputTag]);
    setInputTag("");
  };

  // Remove a tag from the thread
  const removeTag = (tagToRemove: string) => {
    setTags(tags.filter(tag => tag !== tagToRemove));
  };

  // Save thread as draft or publish it
  const saveThread = async (publish: boolean) => {
    if (!title.trim()) {
      setError("Please add a title to your thread");
      return;
    }

    if (segments.some(seg => !seg.content.trim())) {
      setError("Please add content to all thread segments");
      return;
    }

    setIsSubmitting(true);
    setError("");

    try {
      const response = await fetch("/api/threads", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title,
          tags,
          segments: segments.map((seg, index) => ({
            content: seg.content,
            order: index
          })),
          isPublished: publish
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to save thread");
      }

      const data = await response.json();
      router.push(publish ? `/thread/${data.id}` : "/drafts");
      
    } catch (error) {
      console.error("Error saving thread:", error);
      setError("Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <>
      {/* Mobile header */}
      {isMobile && (
        <AppBar position="fixed" color="default" elevation={0} sx={{ borderBottom: 1, borderColor: 'divider' }}>
          <Toolbar>
            <IconButton edge="start" component={Link} href="/" aria-label="back">
              <ArrowBackIcon />
            </IconButton>
            <Typography variant="h6" component="div" sx={{ flexGrow: 1, textAlign: 'center' }}>
              Create Thread
            </Typography>
            <Button 
              onClick={() => saveThread(true)}
              color="primary"
              disabled={isSubmitting}
              size="small"
            >
              {isSubmitting ? <CircularProgress size={24} /> : "Publish"}
            </Button>
          </Toolbar>
        </AppBar>
      )}

      <Container 
        maxWidth="md" 
        sx={{ 
          py: isMobile ? 8 : 4, 
          mt: isMobile ? 4 : 0,
          display: 'flex',
          flexDirection: 'column',
          minHeight: isMobile ? 'calc(100vh - 112px)' : '100vh'
        }}
      >
        {/* Desktop header */}
        {!isMobile && (
          <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 4 }}>
            <Typography variant="h4" fontWeight={700}>
              Create Thread
            </Typography>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button 
                variant="outlined" 
                onClick={() => saveThread(false)}
                disabled={isSubmitting}
              >
                Save Draft
              </Button>
              <Button 
                variant="contained" 
                onClick={() => saveThread(true)}
                disabled={isSubmitting}
              >
                {isSubmitting ? <CircularProgress size={24} color="inherit" /> : "Publish Thread"}
              </Button>
            </Box>
          </Box>
        )}

        <Card variant="outlined" sx={{ p: 3, mb: 3 }}>
          {/* Title input */}
          <TextField
            label="Title"
            fullWidth
            variant="outlined"
            placeholder="What's this thread about?"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            sx={{ mb: 3 }}
            InputProps={{
              sx: { 
                fontSize: '1.1rem',
                fontWeight: 500
              }
            }}
          />
          
          {/* Tags input */}
          <Box sx={{ mb: 3 }}>
            <Typography variant="subtitle2" sx={{ mb: 1 }}>
              Tags
            </Typography>
            <Stack direction="row" spacing={1} sx={{ flexWrap: 'wrap', gap: 1, mb: 2 }}>
              {tags.map((tag) => (
                <Chip
                  key={tag}
                  label={tag}
                  onDelete={() => removeTag(tag)}
                  size="small"
                />
              ))}
              {tags.length === 0 && (
                <Typography variant="body2" color="text.secondary">
                  Add tags to help others discover your thread
                </Typography>
              )}
            </Stack>
            <TextField
              fullWidth
              size="small"
              placeholder="Add a tag (e.g., Productivity, Mindset, Career)"
              value={inputTag}
              onChange={(e) => setInputTag(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && addTag()}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="end">
                    <Button 
                      onClick={addTag}
                      disabled={!inputTag}
                      size="small"
                    >
                      Add
                    </Button>
                  </InputAdornment>
                ),
              }}
            />
          </Box>
        </Card>

        {/* Thread segments */}
        <Box sx={{ flexGrow: 1 }}>
          {/* Segment navigation */}
          <Stack 
            direction="row" 
            spacing={1} 
            sx={{ 
              mb: 2, 
              overflowX: 'auto', 
              pb: 1,
              '&::-webkit-scrollbar': {
                height: 6,
              },
              '&::-webkit-scrollbar-thumb': {
                backgroundColor: 'rgba(0,0,0,0.2)',
                borderRadius: 3,
              }
            }}
          >
            {segments.map((segment) => (
              <Button
                key={segment.id}
                variant={activeSegment === segment.id ? "contained" : "outlined"}
                sx={{ 
                  minWidth: 40,
                  width: 40,
                  height: 40,
                  borderRadius: '50%',
                  p: 0
                }}
                onClick={() => switchToSegment(segment.id)}
              >
                {segment.id}
              </Button>
            ))}
            <Button
              sx={{ 
                minWidth: 40,
                width: 40,
                height: 40,
                borderRadius: '50%',
                p: 0
              }}
              variant="outlined"
              onClick={addSegment}
            >
              <AddIcon fontSize="small" />
            </Button>
          </Stack>
          
          {/* TipTap editor card */}
          <Card 
            variant="outlined" 
            sx={{ 
              p: { xs: 2, sm: 3 },
              mb: 3,
              minHeight: 250,
              display: 'flex',
              flexDirection: 'column'
            }}
          >
            {/* Editor toolbar */}
            <Box 
              sx={{ 
                display: 'flex', 
                gap: 1, 
                mb: 2, 
                pb: 1, 
                borderBottom: 1, 
                borderColor: 'divider'
              }}
            >
              <IconButton 
                size="small"
                onClick={() => editor?.chain().focus().toggleBold().run()}
                color={editor?.isActive('bold') ? 'primary' : 'default'}
              >
                <FormatBoldIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => editor?.chain().focus().toggleItalic().run()}
                color={editor?.isActive('italic') ? 'primary' : 'default'}
              >
                <FormatItalicIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => editor?.chain().focus().toggleBulletList().run()}
                color={editor?.isActive('bulletList') ? 'primary' : 'default'}
              >
                <FormatListBulletedIcon fontSize="small" />
              </IconButton>
              <IconButton 
                size="small"
                onClick={() => editor?.chain().focus().toggleOrderedList().run()}
                color={editor?.isActive('orderedList') ? 'primary' : 'default'}
              >
                <FormatListNumberedIcon fontSize="small" />
              </IconButton>
            </Box>
            
            {/* Editor area */}
            <Box sx={{ flexGrow: 1 }}>
              <EditorContent 
                editor={editor} 
                className="prose max-w-none focus:outline-none" 
              />
              
              {!editor?.getText() && (
                <Box 
                  sx={{ 
                    position: 'absolute',
                    color: 'text.secondary',
                    pointerEvents: 'none',
                    p: 2
                  }}
                >
                  <Typography variant="body1" color="inherit">
                    Share your thoughts in this segment...
                  </Typography>
                </Box>
              )}
            </Box>
          </Card>
        </Box>
        
        {/* Mobile action buttons */}
        {isMobile && (
          <Box sx={{ mt: 'auto', pt: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => saveThread(false)}
              sx={{ mb: 2 }}
              disabled={isSubmitting}
            >
              Save as Draft
            </Button>
          </Box>
        )}
      </Container>

      {/* Error message */}
      <Snackbar
        open={!!error}
        autoHideDuration={6000}
        onClose={() => setError("")}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
      >
        <Alert onClose={() => setError("")} severity="error" sx={{ width: '100%' }}>
          {error}
        </Alert>
      </Snackbar>
    </>
  );
}