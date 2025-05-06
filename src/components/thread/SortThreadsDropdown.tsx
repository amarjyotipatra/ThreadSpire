"use client";

import { useRouter } from "next/navigation";

interface SortThreadsDropdownProps {
  currentSort: string;
  currentTag?: string;
}

export default function SortThreadsDropdown({ currentSort, currentTag }: SortThreadsDropdownProps) {
  const router = useRouter();
  
  const handleSortChange = (sortValue: string) => {
    const params = new URLSearchParams();
    if (currentTag && currentTag !== 'All') {
      params.append('tag', currentTag);
    }
    params.append('sort', sortValue);
    
    router.push(`/explore?${params.toString()}`);
  };
  
  return (
    
    <select 
      onChange={(e: React.ChangeEvent<HTMLSelectElement>) => handleSortChange(e.target.value)}
      className="bg-background border rounded-md px-3 py-1.5"
      defaultValue={currentSort}
    >
      <option value="popular">Most Bookmarked</option>
      <option value="forked">Most Forked</option>
      <option value="newest">Newest</option>
    </select>
  );
}