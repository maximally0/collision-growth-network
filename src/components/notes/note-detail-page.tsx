"use client";

import React from "react";
import { motion } from "framer-motion";
import { ArrowLeft, Clock, Edit } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";

interface Note {
  id: string;
  title: string;
  slug: string;
  content: string;
  published: boolean;
  author_id: string;
  created_at: string;
  updated_at: string;
}

interface NoteDetailPageProps {
  note: Note;
  isFounder: boolean;
}

function renderMarkdown(content: string) {
  // Simple markdown rendering
  const lines = content.split("\n");
  const elements: React.ReactElement[] = [];

  lines.forEach((line, i) => {
    if (line.startsWith("### ")) {
      elements.push(<h3 key={i} className="text-base font-semibold mt-6 mb-2">{line.slice(4)}</h3>);
    } else if (line.startsWith("## ")) {
      elements.push(<h2 key={i} className="text-lg font-semibold mt-8 mb-3">{line.slice(3)}</h2>);
    } else if (line.startsWith("# ")) {
      elements.push(<h1 key={i} className="text-xl font-bold mt-8 mb-3">{line.slice(2)}</h1>);
    } else if (line.startsWith("- ") || line.startsWith("* ")) {
      elements.push(
        <li key={i} className="text-sm text-muted-foreground ml-4 list-disc leading-relaxed">
          {renderInline(line.slice(2))}
        </li>
      );
    } else if (line.startsWith("> ")) {
      elements.push(
        <blockquote key={i} className="border-l-2 border-white/20 pl-4 my-4 text-sm text-muted-foreground italic">
          {renderInline(line.slice(2))}
        </blockquote>
      );
    } else if (line.trim() === "") {
      elements.push(<div key={i} className="h-3" />);
    } else {
      elements.push(
        <p key={i} className="text-sm text-muted-foreground leading-relaxed">
          {renderInline(line)}
        </p>
      );
    }
  });

  return elements;
}

function renderInline(text: string) {
  // Bold
  text = text.replace(/\*\*(.*?)\*\*/g, '<strong class="text-foreground font-medium">$1</strong>');
  // Italic
  text = text.replace(/\*(.*?)\*/g, '<em>$1</em>');
  // Code
  text = text.replace(/`(.*?)`/g, '<code class="text-xs bg-white/[0.06] px-1.5 py-0.5 rounded font-mono">$1</code>');

  return <span dangerouslySetInnerHTML={{ __html: text }} />;
}

export function NoteDetailPage({ note, isFounder }: NoteDetailPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/notes" className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
            <ArrowLeft className="h-4 w-4" />
            Back to notes
          </Link>
          {isFounder && (
            <Link
              href={`/notes/${note.slug}/edit`}
              className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
            >
              <Edit className="h-3.5 w-3.5" />
              Edit
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <motion.article
          initial={{ opacity: 0, y: 12 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.25, 0.1, 0.25, 1] }}
        >
          {/* Meta */}
          <div className="mb-8">
            {!note.published && (
              <span className="inline-block text-[10px] px-2 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium mb-3">
                Draft
              </span>
            )}
            <h1 className="text-2xl font-bold tracking-tight">{note.title}</h1>
            <div className="flex items-center gap-2 mt-2 text-xs text-muted-foreground">
              <Clock className="h-3 w-3" />
              {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
              <span className="text-border">·</span>
              <span>Rishul Chanana</span>
            </div>
          </div>

          {/* Body */}
          <div className="space-y-0">
            {renderMarkdown(note.content)}
          </div>
        </motion.article>
      </main>
    </div>
  );
}
