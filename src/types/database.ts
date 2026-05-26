export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[];

export type UserRole = "agent" | "admin" | "captain";
export type TaskPriority = "low" | "medium" | "high" | "urgent";
export type TaskAction = "comment" | "repost" | "react" | "follow" | "connect" | "dm";
export type SubmissionStatus = "pending" | "approved" | "rejected";
export type UserLevel = "rookie" | "operator" | "growth_agent" | "narrative_captain" | "ecosystem_lead";

export interface Database {
  public: {
    Tables: {
      users: {
        Row: {
          id: string;
          name: string;
          email: string;
          linkedin_url: string | null;
          role: UserRole;
          streak: number;
          xp: number;
          level: UserLevel;
          personality_md: string | null;
          avatar_url: string | null;
          pitch: string | null;
          niche_tags: string[];
          role_title: string | null;
          joined_at: string;
        };
        Insert: {
          id: string;
          name: string;
          email: string;
          linkedin_url?: string | null;
          role?: UserRole;
          streak?: number;
          xp?: number;
          level?: UserLevel;
          personality_md?: string | null;
          avatar_url?: string | null;
          pitch?: string | null;
          niche_tags?: string[];
          role_title?: string | null;
          joined_at?: string;
        };
        Update: {
          id?: string;
          name?: string;
          email?: string;
          linkedin_url?: string | null;
          role?: UserRole;
          streak?: number;
          xp?: number;
          level?: UserLevel;
          personality_md?: string | null;
          avatar_url?: string | null;
          pitch?: string | null;
          niche_tags?: string[];
          role_title?: string | null;
          joined_at?: string;
        };
      };
      engagement_tasks: {
        Row: {
          id: string;
          title: string;
          post_url: string;
          creator_name: string;
          summary: string;
          action_required: TaskAction;
          suggested_angles: string[];
          priority: TaskPriority;
          expires_at: string;
          created_by: string;
          archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          post_url: string;
          creator_name: string;
          summary: string;
          action_required: TaskAction;
          suggested_angles?: string[];
          priority?: TaskPriority;
          expires_at: string;
          created_by: string;
          archived?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          post_url?: string;
          creator_name?: string;
          summary?: string;
          action_required?: TaskAction;
          suggested_angles?: string[];
          priority?: TaskPriority;
          expires_at?: string;
          created_by?: string;
          archived?: boolean;
          created_at?: string;
        };
      };
      people_tasks: {
        Row: {
          id: string;
          profile_url: string;
          name: string;
          role_title: string;
          niche_tags: string[];
          why_they_matter: string;
          suggested_action: TaskAction;
          connection_note: string;
          expires_at: string;
          created_by: string;
          archived: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          profile_url: string;
          name: string;
          role_title: string;
          niche_tags?: string[];
          why_they_matter: string;
          suggested_action: TaskAction;
          connection_note: string;
          expires_at: string;
          created_by: string;
          archived?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          profile_url?: string;
          name?: string;
          role_title?: string;
          niche_tags?: string[];
          why_they_matter?: string;
          suggested_action?: TaskAction;
          connection_note?: string;
          expires_at?: string;
          created_by?: string;
          archived?: boolean;
          created_at?: string;
        };
      };
      narratives: {
        Row: {
          id: string;
          monthly_theme: string;
          weekly_theme: string;
          daily_angle: string;
          start_date: string;
          end_date: string;
          active: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          monthly_theme: string;
          weekly_theme: string;
          daily_angle: string;
          start_date: string;
          end_date: string;
          active?: boolean;
          created_at?: string;
        };
        Update: {
          id?: string;
          monthly_theme?: string;
          weekly_theme?: string;
          daily_angle?: string;
          start_date?: string;
          end_date?: string;
          active?: boolean;
          created_at?: string;
        };
      };
      post_briefs: {
        Row: {
          id: string;
          title: string;
          objective: string;
          core_idea: string;
          structure: string;
          emotional_direction: string;
          reference_urls: string[];
          deadline: string;
          narrative_id: string | null;
          created_by: string;
          created_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          objective: string;
          core_idea: string;
          structure: string;
          emotional_direction: string;
          reference_urls?: string[];
          deadline: string;
          narrative_id?: string | null;
          created_by: string;
          created_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          objective?: string;
          core_idea?: string;
          structure?: string;
          emotional_direction?: string;
          reference_urls?: string[];
          deadline?: string;
          narrative_id?: string | null;
          created_by?: string;
          created_at?: string;
        };
      };
      submissions: {
        Row: {
          id: string;
          user_id: string;
          task_id: string;
          task_type: "engagement" | "people" | "post";
          proof_url: string;
          status: SubmissionStatus;
          xp_awarded: number;
          submitted_at: string;
          reviewed_at: string | null;
        };
        Insert: {
          id?: string;
          user_id: string;
          task_id: string;
          task_type: "engagement" | "people" | "post";
          proof_url: string;
          status?: SubmissionStatus;
          xp_awarded?: number;
          submitted_at?: string;
          reviewed_at?: string | null;
        };
        Update: {
          id?: string;
          user_id?: string;
          task_id?: string;
          task_type?: "engagement" | "people" | "post";
          proof_url?: string;
          status?: SubmissionStatus;
          xp_awarded?: number;
          submitted_at?: string;
          reviewed_at?: string | null;
        };
      };
      founders_notes: {
        Row: {
          id: string;
          title: string;
          slug: string;
          content: string;
          published: boolean;
          author_id: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          title: string;
          slug: string;
          content: string;
          published?: boolean;
          author_id: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          title?: string;
          slug?: string;
          content?: string;
          published?: boolean;
          author_id?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
      cold_emails: {
        Row: {
          id: string;
          prospect_name: string;
          prospect_email: string;
          company: string | null;
          status: "draft" | "sent" | "replied" | "meeting_booked" | "closed";
          subject: string | null;
          notes: string | null;
          sent_at: string | null;
          created_by: string;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id?: string;
          prospect_name: string;
          prospect_email: string;
          company?: string | null;
          status?: "draft" | "sent" | "replied" | "meeting_booked" | "closed";
          subject?: string | null;
          notes?: string | null;
          sent_at?: string | null;
          created_by: string;
          created_at?: string;
          updated_at?: string;
        };
        Update: {
          id?: string;
          prospect_name?: string;
          prospect_email?: string;
          company?: string | null;
          status?: "draft" | "sent" | "replied" | "meeting_booked" | "closed";
          subject?: string | null;
          notes?: string | null;
          sent_at?: string | null;
          created_by?: string;
          created_at?: string;
          updated_at?: string;
        };
      };
    };
  };
}
