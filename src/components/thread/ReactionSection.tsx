"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { ReactionType } from "../../../models/Reaction";

interface ReactionSectionProps {
  segmentId: string;
  reactionCounts: Record<string, number>;
  userReaction: string | null;
  isAuthenticated: boolean;
}

const ReactionSection = ({ 
  segmentId, 
  reactionCounts, 
  userReaction: initialUserReaction,
  isAuthenticated 
}: ReactionSectionProps) => {
  const router = useRouter();
  const [userReaction, setUserReaction] = useState<string | null>(initialUserReaction);
  const [optimisticCounts, setOptimisticCounts] = useState<Record<string, number>>(reactionCounts);

  const reactionEmojis = [
    ReactionType.MIND_BLOWN,
    ReactionType.LIGHT_BULB,
    ReactionType.RELAXED,
    ReactionType.FIRE,
    ReactionType.HEART_HANDS,
  ];

  const handleReaction = async (type: string) => {
    if (!isAuthenticated) {
      // Redirect to login if not authenticated
      router.push("/sign-in");
      return;
    }

    try {
      // Update optimistic UI first
      const oldReaction = userReaction;
      const newReaction = oldReaction === type ? null : type;

      // Optimistically update the UI
      setUserReaction(newReaction);
      
      // Update the counts optimistically
      setOptimisticCounts(prev => {
        const newCounts = { ...prev };
        
        // Remove the old reaction if it exists
        if (oldReaction) {
          newCounts[oldReaction] = Math.max(0, (newCounts[oldReaction] || 0) - 1);
        }
        
        // Add the new reaction if there is one
        if (newReaction) {
          newCounts[newReaction] = (newCounts[newReaction] || 0) + 1;
        }
        
        return newCounts;
      });

      // Send the API request
      const response = await fetch("/api/reactions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          segmentId,
          type: newReaction || null, // null will remove the reaction
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to update reaction");
      }

      // Refresh data to ensure consistency
      router.refresh();
      
    } catch (error) {
      console.error("Error updating reaction:", error);
      
      // Revert optimistic update on error
      setUserReaction(initialUserReaction);
      setOptimisticCounts(reactionCounts);
    }
  };

  return (
    <div className="flex items-center gap-2">
      {reactionEmojis.map((emoji) => {
        const count = optimisticCounts[emoji] || 0;
        const isSelected = userReaction === emoji;
        
        return (
          <button
            key={emoji}
            onClick={() => handleReaction(emoji)}
            className={`flex items-center gap-1 px-2 py-1 rounded-full transition-colors ${
              isSelected
                ? "bg-primary/10 border border-primary"
                : "hover:bg-muted"
            }`}
          >
            <span className="text-lg">{emoji}</span>
            {count > 0 && <span className="text-xs font-medium">{count}</span>}
          </button>
        );
      })}
    </div>
  );
};

export default ReactionSection;