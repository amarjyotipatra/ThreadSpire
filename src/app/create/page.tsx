"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useEditor, EditorContent } from "@tiptap/react";
import StarterKit from "@tiptap/starter-kit";

export default function CreateThread() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [tags, setTags] = useState<string[]>([]);
  const [segments, setSegments] = useState<{id: string, content: string}[]>([
    { id: "1", content: "" }
  ]);
  const [activeSegment, setActiveSegment] = useState("1");
  const [inputTag, setInputTag] = useState("");
  
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

  // Add a new segment to the thread
  const addSegment = () => {
    const newId = String(segments.length + 1);
    setSegments([...segments, { id: newId, content: "" }]);
    setActiveSegment(newId);
    editor?.commands.setContent("");
  };

  // Switch between segments
  const switchToSegment = (id: string) => {
    setActiveSegment(id);
    const segment = segments.find(seg => seg.id === id);
    editor?.commands.setContent(segment?.content || "");
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
    }
  };

  return (
    <div className="max-w-4xl mx-auto py-10 px-4">
      <h1 className="text-3xl font-bold mb-8">Create Thread</h1>
      
      {/* Title input */}
      <div className="mb-6">
        <label htmlFor="title" className="block mb-2 font-medium">
          Title
        </label>
        <input
          type="text"
          id="title"
          className="w-full p-3 border rounded-md bg-background"
          placeholder="Enter a title for your wisdom thread..."
          value={title}
          onChange={(e) => setTitle(e.target.value)}
        />
      </div>
      
      {/* Tags input */}
      <div className="mb-8">
        <label htmlFor="tags" className="block mb-2 font-medium">
          Tags
        </label>
        <div className="flex flex-wrap gap-2 mb-2">
          {tags.map((tag) => (
            <div key={tag} className="bg-secondary rounded-full px-3 py-1 flex items-center gap-2">
              <span>{tag}</span>
              <button 
                onClick={() => removeTag(tag)}
                className="text-muted-foreground hover:text-foreground"
              >
                &times;
              </button>
            </div>
          ))}
        </div>
        <div className="flex">
          <input
            type="text"
            id="tags"
            className="flex-1 p-3 border rounded-l-md bg-background"
            placeholder="Add a tag (e.g., Productivity, Mindset, Career)"
            value={inputTag}
            onChange={(e) => setInputTag(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && addTag()}
          />
          <button
            onClick={addTag}
            className="bg-secondary px-4 rounded-r-md"
          >
            Add
          </button>
        </div>
      </div>
      
      {/* Thread segments navigation */}
      <div className="mb-4">
        <div className="flex items-center gap-2 mb-4">
          {segments.map((segment) => (
            <button
              key={segment.id}
              onClick={() => switchToSegment(segment.id)}
              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                activeSegment === segment.id
                  ? "bg-primary text-primary-foreground"
                  : "bg-secondary"
              }`}
            >
              {segment.id}
            </button>
          ))}
          <button
            onClick={addSegment}
            className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center"
          >
            +
          </button>
        </div>
      </div>
      
      {/* TipTap editor */}
      <div className="mb-8 border rounded-md p-4 min-h-[300px] bg-card dark:bg-card">
        <EditorContent editor={editor} className="prose dark:prose-invert max-w-none" />
      </div>
      
      {/* Action buttons */}
      <div className="flex justify-end gap-4">
        <button 
          onClick={() => saveThread(false)}
          className="px-4 py-2 border rounded-md hover:bg-muted transition-colors"
        >
          Save as Draft
        </button>
        <button 
          onClick={() => saveThread(true)}
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:opacity-90 transition-opacity"
        >
          Publish Thread
        </button>
      </div>
    </div>
  );
}