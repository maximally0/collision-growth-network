"use client";

import { motion } from "framer-motion";
import { BookOpen, Plus, ArrowLeft, Clock, FileText } from "lucide-react";
import Link from "next/link";
import { formatDistanceToNow } from "date-fns";
import type { Database } from "@/types/database";

type User = Database["public"]["Tables"]["users"]["Row"];

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

interface NotesListPageProps {
  user: User | null;
  notes: Note[];
  drafts: Note[];
  isFounder: boolean;
}

const container = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.06 } },
};

const item = {
  hidden: { opacity: 0, y: 8 },
  show: { opacity: 1, y: 0, transition: { duration: 0.3, ease: [0.25, 0.1, 0.25, 1] as const } },
};

export function NotesListPage({ user, notes, drafts, isFounder }: NotesListPageProps) {
  return (
    <div className="min-h-screen">
      {/* Header */}
      <header className="border-b border-border">
        <div className="max-w-3xl mx-auto px-6 py-4 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <Link href="/" className="text-muted-foreground hover:text-foreground transition-colors">
              <ArrowLeft className="h-4 w-4" />
            </Link>
            <div className="flex items-center gap-2">
              <BookOpen className="h-4 w-4 text-amber-400" />
              <span className="text-sm font-semibold">Founder&apos;s Notes</span>
            </div>
          </div>
          {isFounder && (
            <Link
              href="/notes/new"
              className="flex items-center gap-1.5 text-xs font-medium px-3 py-1.5 rounded-md bg-white text-black hover:bg-white/90 transition-colors"
            >
              <Plus className="h-3.5 w-3.5" />
              New Note
            </Link>
          )}
        </div>
      </header>

      {/* Content */}
      <main className="max-w-3xl mx-auto px-6 py-8">
        <motion.div
          variants={container}
          initial="hidden"
          animate="show"
          className="space-y-8"
        >
          {/* Drafts (founder only) */}
          {isFounder && drafts.length > 0 && (
            <motion.div variants={item}>
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Drafts
              </h2>
              <div className="space-y-2">
                {drafts.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.slug}`}
                    className="block p-4 rounded-lg border border-dashed border-border hover:border-white/20 hover:bg-white/[0.02] transition-all"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      <FileText className="h-3.5 w-3.5 text-muted-foreground" />
                      <span className="text-sm font-medium">{note.title}</span>
                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-yellow-500/10 text-yellow-400 font-medium">
                        Draft
                      </span>
                    </div>
                    <p className="text-xs text-muted-foreground line-clamp-1 ml-5.5">
                      {note.content.slice(0, 120)}...
                    </p>
                  </Link>
                ))}
              </div>
            </motion.div>
          )}

          {/* Published Notes */}
          <motion.div variants={item}>
            {notes.length > 0 && (
              <h2 className="text-xs font-medium text-muted-foreground uppercase tracking-widest mb-3">
                Published
              </h2>
            )}
            <div className="space-y-2">
              {notes.length === 0 ? (
                <div className="text-center py-16">
                  <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-3" />
                  <p className="text-sm text-muted-foreground">No notes published yet.</p>
                  <p className="text-xs text-muted-foreground mt-1">Check back soon.</p>
                </div>
              ) : (
                notes.map((note) => (
                  <Link
                    key={note.id}
                    href={`/notes/${note.slug}`}
                    className="block p-4 rounded-lg border border-border hover:border-white/20 hover:bg-white/[0.02] transition-all group"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-semibold group-hover:text-foreground transition-colors">
                          {note.title}
                        </h3>
                        <p className="text-xs text-muted-foreground mt-1 line-clamp-2 leading-relaxed">
                          {note.content.slice(0, 200).replace(/[#*_`]/g, "")}...
                        </p>
                      </div>
                      <div className="flex items-center gap-1 text-[10px] text-muted-foreground shrink-0 mt-0.5">
                        <Clock className="h-3 w-3" />
                        {formatDistanceToNow(new Date(note.created_at), { addSuffix: true })}
                      </div>
                    </div>
                  </Link>
                ))
              )}
            </div>
          </motion.div>
        </motion.div>
      </main>
    </div>
  );
}
