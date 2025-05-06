"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkIcon, GitForkIcon, Share2Icon, CheckIcon, AlertCircleIcon } from "lucide-react";

interface ThreadActionsProps {
  threadId: string;
  authorId: string;
  currentUserId?: string;
}

const ThreadActions = ({ threadId, authorId, currentUserId }: ThreadActionsProps) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'error' } | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const showNotification = (message: string, type: 'success' | 'error') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 3000);
  };

  const handleBookmark = async () => {
    if (!currentUserId) {
      router.push("/sign-in");
      return;
    }

    try {
      // Optimistic UI update
      setIsBookmarked((prev: boolean): boolean => !prev);
      
      const response = await fetch("/api/bookmarks", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to bookmark thread");
      }

      showNotification("Thread bookmarked successfully", "success");
      router.refresh();
    } catch (error) {
      console.error("Error bookmarking thread:", error);
      // Revert optimistic update on error
      setIsBookmarked(prev => !prev);
      showNotification("Failed to bookmark thread. Please try again.", "error");
    }
  };

  const handleFork = async () => {
    if (!currentUserId) {
      router.push("/sign-in");
      return;
    }

    setIsLoading(true);
    
    try {
      const response = await fetch("/api/threads/fork", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          threadId,
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to fork thread");
      }

      const data = await response.json();
      showNotification("Thread forked successfully", "success");
      
      // Redirect to the editor to continue editing the forked thread
      router.push(`/create?threadId=${data.id}`);
    } catch (error) {
      console.error("Error forking thread:", error);
      showNotification("Failed to fork thread. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: "Check out this thread on ThreadSpire",
          url: window.location.href,
        });
      } catch (error) {
        console.error("Error sharing:", error);
      }
    } else {
      // Fallback for browsers that don't support navigator.share
      navigator.clipboard.writeText(window.location.href);
      showNotification("URL copied to clipboard", "success");
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBookmark}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            isBookmarked
              ? "bg-primary/20 text-primary"
              : "hover:bg-muted"
          }`}
          title="Bookmark this thread"
        >
          <BookmarkIcon size={18} className={isBookmarked ? "fill-primary" : ""} />
        </button>
        
        <button
          onClick={handleFork}
          disabled={isLoading}
          className={`flex items-center justify-center w-10 h-10 rounded-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
          }`}
          title="Fork this thread"
        >
          <GitForkIcon size={18} />
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-10 h-10 rounded-full hover:bg-muted"
          title="Share this thread"
        >
          <Share2Icon size={18} />
        </button>
      </div>
      
      {notification && (
        <div className={`notification notification-${notification.type}`}>
          {notification.type === 'success' ? (
            <CheckIcon size={18} />
          ) : (
            <AlertCircleIcon size={18} />
          )}
          <span>{notification.message}</span>
        </div>
      )}
    </div>
  );
};

export default ThreadActions;