"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { BookmarkIcon, GitForkIcon, Share2Icon, CheckIcon } from "lucide-react";

interface ThreadActionsProps {
  threadId: string;
  authorId: string;
  currentUserId?: string;
}

const ThreadActions = ({ threadId, authorId, currentUserId }: ThreadActionsProps) => {
  const router = useRouter();
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [isLoading, setIsLoading] = useState(false);

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

      setSuccessMessage("Thread bookmarked successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      router.refresh();
    } catch (error) {
      console.error("Error bookmarking thread:", error);
      // Revert optimistic update on error
      setIsBookmarked(prev => !prev);
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
      setSuccessMessage("Thread forked successfully");
      setTimeout(() => setSuccessMessage(""), 3000);
      
      // Redirect to the editor to continue editing the forked thread
      router.push(`/create?threadId=${data.id}`);
    } catch (error) {
      console.error("Error forking thread:", error);
      setSuccessMessage("Failed to fork thread. Please try again.");
      setTimeout(() => setSuccessMessage(""), 3000);
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
      setSuccessMessage("URL copied to clipboard");
      setTimeout(() => setSuccessMessage(""), 3000);
    }
  };

  return (
    <div className="relative">
      <div className="flex items-center gap-3">
        <button
          onClick={handleBookmark}
          className={`flex items-center justify-center w-9 h-9 rounded-full ${
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
          className={`flex items-center justify-center w-9 h-9 rounded-full ${
            isLoading ? "opacity-50 cursor-not-allowed" : "hover:bg-muted"
          }`}
          title="Fork this thread"
        >
          <GitForkIcon size={18} />
        </button>
        
        <button
          onClick={handleShare}
          className="flex items-center justify-center w-9 h-9 rounded-full hover:bg-muted"
          title="Share this thread"
        >
          <Share2Icon size={18} />
        </button>
      </div>
      
      {successMessage && (
        <div className="absolute top-full right-0 mt-2 bg-green-100 dark:bg-green-900 text-green-800 dark:text-green-100 text-sm py-1 px-3 rounded-md flex items-center gap-2">
          <CheckIcon size={14} />
          {successMessage}
        </div>
      )}
    </div>
  );
};

export default ThreadActions;