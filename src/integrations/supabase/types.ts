export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type Database = {
  // Allows to automatically instantiate createClient with right options
  // instead of createClient<Database, { PostgrestVersion: 'XX' }>(URL, KEY)
  __InternalSupabase: {
    PostgrestVersion: "14.5"
  }
  public: {
    Tables: {
      achievers: {
        Row: {
          achievement_ar: string | null
          achievement_en: string | null
          award_year: string | null
          branch_ar: string | null
          branch_en: string | null
          category: string
          created_at: string
          created_by: string | null
          field_ar: string | null
          field_en: string | null
          id: string
          image_path: string | null
          is_published: boolean
          name_ar: string
          name_en: string | null
          section: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          achievement_ar?: string | null
          achievement_en?: string | null
          award_year?: string | null
          branch_ar?: string | null
          branch_en?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          field_ar?: string | null
          field_en?: string | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          name_ar: string
          name_en?: string | null
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          achievement_ar?: string | null
          achievement_en?: string | null
          award_year?: string | null
          branch_ar?: string | null
          branch_en?: string | null
          category?: string
          created_at?: string
          created_by?: string | null
          field_ar?: string | null
          field_en?: string | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          name_ar?: string
          name_en?: string | null
          section?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      announcements: {
        Row: {
          created_at: string
          created_by: string | null
          end_at: string | null
          id: string
          link_label_ar: string | null
          link_label_en: string | null
          link_url: string | null
          message_ar: string
          message_en: string | null
          priority: string
          start_at: string | null
          status: string
          title_ar: string
          title_en: string | null
          type: string
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          end_at?: string | null
          id?: string
          link_label_ar?: string | null
          link_label_en?: string | null
          link_url?: string | null
          message_ar: string
          message_en?: string | null
          priority?: string
          start_at?: string | null
          status?: string
          title_ar: string
          title_en?: string | null
          type?: string
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          end_at?: string | null
          id?: string
          link_label_ar?: string | null
          link_label_en?: string | null
          link_url?: string | null
          message_ar?: string
          message_en?: string | null
          priority?: string
          start_at?: string | null
          status?: string
          title_ar?: string
          title_en?: string | null
          type?: string
          updated_at?: string
        }
        Relationships: []
      }
      article_categories: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          name_ar: string
          name_en: string | null
          slug: string
          sort_order: number
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          name_ar: string
          name_en?: string | null
          slug: string
          sort_order?: number
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          name_ar?: string
          name_en?: string | null
          slug?: string
          sort_order?: number
        }
        Relationships: []
      }
      article_tag_relations: {
        Row: {
          article_id: string
          tag_id: string
        }
        Insert: {
          article_id: string
          tag_id: string
        }
        Update: {
          article_id?: string
          tag_id?: string
        }
        Relationships: [
          {
            foreignKeyName: "article_tag_relations_article_id_fkey"
            columns: ["article_id"]
            isOneToOne: false
            referencedRelation: "articles"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "article_tag_relations_tag_id_fkey"
            columns: ["tag_id"]
            isOneToOne: false
            referencedRelation: "article_tags"
            referencedColumns: ["id"]
          },
        ]
      }
      article_tags: {
        Row: {
          created_at: string
          id: string
          name_ar: string
          name_en: string | null
          slug: string
        }
        Insert: {
          created_at?: string
          id?: string
          name_ar: string
          name_en?: string | null
          slug: string
        }
        Update: {
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string | null
          slug?: string
        }
        Relationships: []
      }
      articles: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          category_id: string | null
          content_ar: string | null
          content_en: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          excerpt_ar: string | null
          excerpt_en: string | null
          featured_media_path: string | null
          id: string
          is_featured: boolean
          published_at: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          slug: string
          slug_ar: string | null
          status: Database["public"]["Enums"]["record_status"]
          title_ar: string
          title_en: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          featured_media_path?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug: string
          slug_ar?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          title_ar: string
          title_en?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          category_id?: string | null
          content_ar?: string | null
          content_en?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          featured_media_path?: string | null
          id?: string
          is_featured?: boolean
          published_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug?: string
          slug_ar?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "articles_category_id_fkey"
            columns: ["category_id"]
            isOneToOne: false
            referencedRelation: "article_categories"
            referencedColumns: ["id"]
          },
        ]
      }
      audit_log: {
        Row: {
          action: string
          actor_id: string | null
          created_at: string
          details: Json | null
          entity: string
          entity_id: string | null
          id: string
        }
        Insert: {
          action: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity: string
          entity_id?: string | null
          id?: string
        }
        Update: {
          action?: string
          actor_id?: string | null
          created_at?: string
          details?: Json | null
          entity?: string
          entity_id?: string | null
          id?: string
        }
        Relationships: []
      }
      audit_logs: {
        Row: {
          action: string
          actor_user_id: string | null
          after_data: Json | null
          before_data: Json | null
          created_at: string
          entity_id: string | null
          entity_type: string
          id: string
          ip_address: string | null
          metadata: Json | null
          user_agent: string | null
        }
        Insert: {
          action: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Update: {
          action?: string
          actor_user_id?: string | null
          after_data?: Json | null
          before_data?: Json | null
          created_at?: string
          entity_id?: string | null
          entity_type?: string
          id?: string
          ip_address?: string | null
          metadata?: Json | null
          user_agent?: string | null
        }
        Relationships: []
      }
      branches: {
        Row: {
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          elder_ar: string | null
          elder_en: string | null
          id: string
          image_path: string | null
          is_published: boolean
          name_ar: string
          name_en: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          elder_ar?: string | null
          elder_en?: string | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          name_ar: string
          name_en?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          elder_ar?: string | null
          elder_en?: string | null
          id?: string
          image_path?: string | null
          is_published?: boolean
          name_ar?: string
          name_en?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      businesses: {
        Row: {
          category_ar: string
          category_en: string
          city_ar: string
          city_en: string | null
          contact: string
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_published: boolean
          logo_path: string | null
          name_ar: string
          name_en: string | null
          owner_branch_ar: string | null
          owner_branch_en: string | null
          slug: string
          sort_order: number
          updated_at: string
          website: string | null
        }
        Insert: {
          category_ar: string
          category_en: string
          city_ar?: string
          city_en?: string | null
          contact: string
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean
          logo_path?: string | null
          name_ar: string
          name_en?: string | null
          owner_branch_ar?: string | null
          owner_branch_en?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Update: {
          category_ar?: string
          category_en?: string
          city_ar?: string
          city_en?: string | null
          contact?: string
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean
          logo_path?: string | null
          name_ar?: string
          name_en?: string | null
          owner_branch_ar?: string | null
          owner_branch_en?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
          website?: string | null
        }
        Relationships: []
      }
      contact_messages: {
        Row: {
          created_at: string
          email: string
          id: string
          locale: string
          message: string
          name: string
          phone: string | null
          status: Database["public"]["Enums"]["message_status"]
          subject: string | null
          submitted_by: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          locale?: string
          message: string
          name: string
          phone?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          locale?: string
          message?: string
          name?: string
          phone?: string | null
          status?: Database["public"]["Enums"]["message_status"]
          subject?: string | null
          submitted_by?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      content_pages: {
        Row: {
          author_id: string | null
          canonical_url: string | null
          created_at: string
          created_by: string | null
          deleted_at: string | null
          excerpt_ar: string | null
          excerpt_en: string | null
          featured_media_path: string | null
          id: string
          no_index: boolean
          published_at: string | null
          seo_description_ar: string | null
          seo_description_en: string | null
          seo_title_ar: string | null
          seo_title_en: string | null
          slug: string
          slug_ar: string | null
          status: Database["public"]["Enums"]["record_status"]
          template: string
          title_ar: string
          title_en: string | null
          updated_at: string
          updated_by: string | null
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          author_id?: string | null
          canonical_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          featured_media_path?: string | null
          id?: string
          no_index?: boolean
          published_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug: string
          slug_ar?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          template?: string
          title_ar: string
          title_en?: string | null
          updated_at?: string
          updated_by?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          author_id?: string | null
          canonical_url?: string | null
          created_at?: string
          created_by?: string | null
          deleted_at?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          featured_media_path?: string | null
          id?: string
          no_index?: boolean
          published_at?: string | null
          seo_description_ar?: string | null
          seo_description_en?: string | null
          seo_title_ar?: string | null
          seo_title_en?: string | null
          slug?: string
          slug_ar?: string | null
          status?: Database["public"]["Enums"]["record_status"]
          template?: string
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          updated_by?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: []
      }
      content_revisions: {
        Row: {
          change_summary: string | null
          content_page_id: string
          created_at: string
          created_by: string | null
          id: string
          snapshot: Json
          version: number
        }
        Insert: {
          change_summary?: string | null
          content_page_id: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot: Json
          version: number
        }
        Update: {
          change_summary?: string | null
          content_page_id?: string
          created_at?: string
          created_by?: string | null
          id?: string
          snapshot?: Json
          version?: number
        }
        Relationships: [
          {
            foreignKeyName: "content_revisions_content_page_id_fkey"
            columns: ["content_page_id"]
            isOneToOne: false
            referencedRelation: "content_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      content_sections: {
        Row: {
          created_at: string
          data: Json
          id: string
          page_id: string
          settings: Json
          sort_order: number
          type: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          created_at?: string
          data?: Json
          id?: string
          page_id: string
          settings?: Json
          sort_order?: number
          type: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          created_at?: string
          data?: Json
          id?: string
          page_id?: string
          settings?: Json
          sort_order?: number
          type?: string
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "content_sections_page_id_fkey"
            columns: ["page_id"]
            isOneToOne: false
            referencedRelation: "content_pages"
            referencedColumns: ["id"]
          },
        ]
      }
      contributions: {
        Row: {
          amount: number
          contributor_name: string
          created_at: string
          currency: string
          email: string | null
          id: string
          method: string
          phone: string | null
          purpose: string | null
          receipt_path: string | null
          reference: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["contribution_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          amount: number
          contributor_name: string
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          method?: string
          phone?: string | null
          purpose?: string | null
          receipt_path?: string | null
          reference?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["contribution_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          amount?: number
          contributor_name?: string
          created_at?: string
          currency?: string
          email?: string | null
          id?: string
          method?: string
          phone?: string | null
          purpose?: string | null
          receipt_path?: string | null
          reference?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["contribution_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      council_committees: {
        Row: {
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          is_active: boolean
          name_ar: string
          name_en: string | null
          slug: string
          sort_order: number
          updated_at: string
        }
        Insert: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          name_ar: string
          name_en?: string | null
          slug: string
          sort_order?: number
          updated_at?: string
        }
        Update: {
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_active?: boolean
          name_ar?: string
          name_en?: string | null
          slug?: string
          sort_order?: number
          updated_at?: string
        }
        Relationships: []
      }
      documents: {
        Row: {
          category: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          file_path: string | null
          id: string
          media_asset_id: string | null
          service_id: string | null
          status: string
          title_ar: string
          title_en: string | null
          updated_at: string
          uploaded_by: string | null
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          category?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          file_path?: string | null
          id?: string
          media_asset_id?: string | null
          service_id?: string | null
          status?: string
          title_ar: string
          title_en?: string | null
          updated_at?: string
          uploaded_by?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          category?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          file_path?: string | null
          id?: string
          media_asset_id?: string | null
          service_id?: string | null
          status?: string
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          uploaded_by?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "documents_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "documents_service_id_fkey"
            columns: ["service_id"]
            isOneToOne: false
            referencedRelation: "services"
            referencedColumns: ["id"]
          },
        ]
      }
      event_registrations: {
        Row: {
          attendees_count: number
          created_at: string
          email: string
          event_id: string
          id: string
          name: string
          notes: string | null
          phone: string | null
          registered_by: string | null
          status: string
        }
        Insert: {
          attendees_count?: number
          created_at?: string
          email: string
          event_id: string
          id?: string
          name: string
          notes?: string | null
          phone?: string | null
          registered_by?: string | null
          status?: string
        }
        Update: {
          attendees_count?: number
          created_at?: string
          email?: string
          event_id?: string
          id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          registered_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "event_registrations_event_id_fkey"
            columns: ["event_id"]
            isOneToOne: false
            referencedRelation: "events"
            referencedColumns: ["id"]
          },
        ]
      }
      events: {
        Row: {
          cover_path: string | null
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          end_at: string | null
          id: string
          max_attendees: number | null
          place_id: string | null
          registration_deadline: string | null
          registration_enabled: boolean
          slug: string
          start_at: string
          status: string
          timezone: string
          title_ar: string
          title_en: string | null
          updated_at: string
          updated_by: string | null
        }
        Insert: {
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          end_at?: string | null
          id?: string
          max_attendees?: number | null
          place_id?: string | null
          registration_deadline?: string | null
          registration_enabled?: boolean
          slug: string
          start_at: string
          status?: string
          timezone?: string
          title_ar: string
          title_en?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Update: {
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          end_at?: string | null
          id?: string
          max_attendees?: number | null
          place_id?: string | null
          registration_deadline?: string | null
          registration_enabled?: boolean
          slug?: string
          start_at?: string
          status?: string
          timezone?: string
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          updated_by?: string | null
        }
        Relationships: [
          {
            foreignKeyName: "events_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      family_history_entries: {
        Row: {
          created_at: string
          date: string | null
          date_end: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          media_path: string | null
          place_id: string | null
          sort_order: number
          title_ar: string
          title_en: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          created_at?: string
          date?: string | null
          date_end?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          media_path?: string | null
          place_id?: string | null
          sort_order?: number
          title_ar: string
          title_en?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          created_at?: string
          date?: string | null
          date_end?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          media_path?: string | null
          place_id?: string | null
          sort_order?: number
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "family_history_entries_place_id_fkey"
            columns: ["place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      family_member_privacy: {
        Row: {
          member_id: string
          private_notes: string | null
          show_biography: boolean
          show_contact: boolean
          show_dob: boolean
          show_relationships: boolean
          updated_at: string
        }
        Insert: {
          member_id: string
          private_notes?: string | null
          show_biography?: boolean
          show_contact?: boolean
          show_dob?: boolean
          show_relationships?: boolean
          updated_at?: string
        }
        Update: {
          member_id?: string
          private_notes?: string | null
          show_biography?: boolean
          show_contact?: boolean
          show_dob?: boolean
          show_relationships?: boolean
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_member_privacy_member_id_fkey"
            columns: ["member_id"]
            isOneToOne: true
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      family_members: {
        Row: {
          avatar_path: string | null
          biography_ar: string | null
          biography_en: string | null
          birth_place_id: string | null
          branch_id: string | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          current_place_id: string | null
          date_of_birth: string | null
          date_of_death: string | null
          deleted_at: string | null
          display_name_ar: string | null
          display_name_en: string | null
          education_ar: string | null
          education_en: string | null
          first_name_ar: string
          first_name_en: string | null
          gender: Database["public"]["Enums"]["gender"]
          generation: number
          id: string
          is_living: boolean
          last_name_ar: string
          last_name_en: string | null
          middle_name_ar: string | null
          middle_name_en: string | null
          occupation_ar: string | null
          occupation_en: string | null
          slug: string
          sort_order: number
          status: Database["public"]["Enums"]["record_status"]
          updated_at: string
          updated_by: string | null
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          avatar_path?: string | null
          biography_ar?: string | null
          biography_en?: string | null
          birth_place_id?: string | null
          branch_id?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          current_place_id?: string | null
          date_of_birth?: string | null
          date_of_death?: string | null
          deleted_at?: string | null
          display_name_ar?: string | null
          display_name_en?: string | null
          education_ar?: string | null
          education_en?: string | null
          first_name_ar: string
          first_name_en?: string | null
          gender?: Database["public"]["Enums"]["gender"]
          generation?: number
          id?: string
          is_living?: boolean
          last_name_ar: string
          last_name_en?: string | null
          middle_name_ar?: string | null
          middle_name_en?: string | null
          occupation_ar?: string | null
          occupation_en?: string | null
          slug: string
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          updated_by?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          avatar_path?: string | null
          biography_ar?: string | null
          biography_en?: string | null
          birth_place_id?: string | null
          branch_id?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          current_place_id?: string | null
          date_of_birth?: string | null
          date_of_death?: string | null
          deleted_at?: string | null
          display_name_ar?: string | null
          display_name_en?: string | null
          education_ar?: string | null
          education_en?: string | null
          first_name_ar?: string
          first_name_en?: string | null
          gender?: Database["public"]["Enums"]["gender"]
          generation?: number
          id?: string
          is_living?: boolean
          last_name_ar?: string
          last_name_en?: string | null
          middle_name_ar?: string | null
          middle_name_en?: string | null
          occupation_ar?: string | null
          occupation_en?: string | null
          slug?: string
          sort_order?: number
          status?: Database["public"]["Enums"]["record_status"]
          updated_at?: string
          updated_by?: string | null
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "family_members_birth_place_id_fkey"
            columns: ["birth_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_branch_id_fkey"
            columns: ["branch_id"]
            isOneToOne: false
            referencedRelation: "branches"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_members_current_place_id_fkey"
            columns: ["current_place_id"]
            isOneToOne: false
            referencedRelation: "places"
            referencedColumns: ["id"]
          },
        ]
      }
      family_relationships: {
        Row: {
          created_at: string
          id: string
          metadata: Json | null
          person_id: string
          related_person_id: string
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          updated_at: string
        }
        Insert: {
          created_at?: string
          id?: string
          metadata?: Json | null
          person_id: string
          related_person_id: string
          relationship_type: Database["public"]["Enums"]["relationship_type"]
          updated_at?: string
        }
        Update: {
          created_at?: string
          id?: string
          metadata?: Json | null
          person_id?: string
          related_person_id?: string
          relationship_type?: Database["public"]["Enums"]["relationship_type"]
          updated_at?: string
        }
        Relationships: [
          {
            foreignKeyName: "family_relationships_person_id_fkey"
            columns: ["person_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "family_relationships_related_person_id_fkey"
            columns: ["related_person_id"]
            isOneToOne: false
            referencedRelation: "family_members"
            referencedColumns: ["id"]
          },
        ]
      }
      galleries: {
        Row: {
          cover_media_path: string | null
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          parent_id: string | null
          section: string
          slug: string
          sort_order: number
          source_drive_folder_id: string | null
          status: string
          title_ar: string
          title_en: string | null
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          cover_media_path?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          parent_id?: string | null
          section?: string
          slug: string
          sort_order?: number
          source_drive_folder_id?: string | null
          status?: string
          title_ar: string
          title_en?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          cover_media_path?: string | null
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          parent_id?: string | null
          section?: string
          slug?: string
          sort_order?: number
          source_drive_folder_id?: string | null
          status?: string
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "galleries_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
        ]
      }
      gallery_media: {
        Row: {
          caption_ar: string | null
          caption_en: string | null
          created_at: string
          gallery_id: string
          id: string
          is_published: boolean
          media_asset_id: string
          sort_order: number
        }
        Insert: {
          caption_ar?: string | null
          caption_en?: string | null
          created_at?: string
          gallery_id: string
          id?: string
          is_published?: boolean
          media_asset_id: string
          sort_order?: number
        }
        Update: {
          caption_ar?: string | null
          caption_en?: string | null
          created_at?: string
          gallery_id?: string
          id?: string
          is_published?: boolean
          media_asset_id?: string
          sort_order?: number
        }
        Relationships: [
          {
            foreignKeyName: "gallery_media_gallery_id_fkey"
            columns: ["gallery_id"]
            isOneToOne: false
            referencedRelation: "galleries"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "gallery_media_media_asset_id_fkey"
            columns: ["media_asset_id"]
            isOneToOne: false
            referencedRelation: "media_assets"
            referencedColumns: ["id"]
          },
        ]
      }
      initiative_registrations: {
        Row: {
          created_at: string
          email: string
          id: string
          initiative_id: string
          name: string
          notes: string | null
          phone: string | null
          registered_by: string | null
          status: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          initiative_id: string
          name: string
          notes?: string | null
          phone?: string | null
          registered_by?: string | null
          status?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          initiative_id?: string
          name?: string
          notes?: string | null
          phone?: string | null
          registered_by?: string | null
          status?: string
        }
        Relationships: [
          {
            foreignKeyName: "initiative_registrations_initiative_id_fkey"
            columns: ["initiative_id"]
            isOneToOne: false
            referencedRelation: "initiatives"
            referencedColumns: ["id"]
          },
        ]
      }
      initiatives: {
        Row: {
          body_ar: string | null
          body_en: string | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          id: string
          is_published: boolean
          kind: string
          slug: string
          sort_order: number
          status: string
          summary_ar: string | null
          summary_en: string | null
          title_ar: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          body_ar?: string | null
          body_en?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          slug: string
          sort_order?: number
          status?: string
          summary_ar?: string | null
          summary_en?: string | null
          title_ar: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          body_ar?: string | null
          body_en?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          id?: string
          is_published?: boolean
          kind?: string
          slug?: string
          sort_order?: number
          status?: string
          summary_ar?: string | null
          summary_en?: string | null
          title_ar?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inquiries: {
        Row: {
          assigned_to: string | null
          created_at: string
          email: string
          id: string
          message: string
          name: string
          phone: string | null
          request_metadata: Json
          source: string
          status: string
          subject: string | null
          updated_at: string
        }
        Insert: {
          assigned_to?: string | null
          created_at?: string
          email: string
          id?: string
          message: string
          name: string
          phone?: string | null
          request_metadata?: Json
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Update: {
          assigned_to?: string | null
          created_at?: string
          email?: string
          id?: string
          message?: string
          name?: string
          phone?: string | null
          request_metadata?: Json
          source?: string
          status?: string
          subject?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      inquiry_notes: {
        Row: {
          author_id: string | null
          created_at: string
          id: string
          inquiry_id: string
          note: string
        }
        Insert: {
          author_id?: string | null
          created_at?: string
          id?: string
          inquiry_id: string
          note: string
        }
        Update: {
          author_id?: string | null
          created_at?: string
          id?: string
          inquiry_id?: string
          note?: string
        }
        Relationships: [
          {
            foreignKeyName: "inquiry_notes_inquiry_id_fkey"
            columns: ["inquiry_id"]
            isOneToOne: false
            referencedRelation: "inquiries"
            referencedColumns: ["id"]
          },
        ]
      }
      library_items: {
        Row: {
          collection: string
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          external_url: string | null
          file_path: string | null
          id: string
          is_published: boolean
          kind: string | null
          reference: string | null
          sort_order: number
          title_ar: string
          title_en: string | null
          updated_at: string
          year: number | null
        }
        Insert: {
          collection?: string
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean
          kind?: string | null
          reference?: string | null
          sort_order?: number
          title_ar: string
          title_en?: string | null
          updated_at?: string
          year?: number | null
        }
        Update: {
          collection?: string
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          external_url?: string | null
          file_path?: string | null
          id?: string
          is_published?: boolean
          kind?: string | null
          reference?: string | null
          sort_order?: number
          title_ar?: string
          title_en?: string | null
          updated_at?: string
          year?: number | null
        }
        Relationships: []
      }
      media_assets: {
        Row: {
          alt_text_ar: string | null
          alt_text_en: string | null
          bucket: string
          caption_ar: string | null
          caption_en: string | null
          copyright: string | null
          created_at: string
          duration: number | null
          file_name: string
          file_size: number
          height: number | null
          id: string
          mime_type: string
          original_file_name: string | null
          public_url: string | null
          source_drive_file_id: string | null
          storage_path: string
          updated_at: string
          uploaded_by: string | null
          width: number | null
        }
        Insert: {
          alt_text_ar?: string | null
          alt_text_en?: string | null
          bucket?: string
          caption_ar?: string | null
          caption_en?: string | null
          copyright?: string | null
          created_at?: string
          duration?: number | null
          file_name: string
          file_size: number
          height?: number | null
          id?: string
          mime_type: string
          original_file_name?: string | null
          public_url?: string | null
          source_drive_file_id?: string | null
          storage_path: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Update: {
          alt_text_ar?: string | null
          alt_text_en?: string | null
          bucket?: string
          caption_ar?: string | null
          caption_en?: string | null
          copyright?: string | null
          created_at?: string
          duration?: number | null
          file_name?: string
          file_size?: number
          height?: number | null
          id?: string
          mime_type?: string
          original_file_name?: string | null
          public_url?: string | null
          source_drive_file_id?: string | null
          storage_path?: string
          updated_at?: string
          uploaded_by?: string | null
          width?: number | null
        }
        Relationships: []
      }
      membership_requests: {
        Row: {
          branch_slug: string | null
          created_at: string
          email: string
          father_lineage: string | null
          full_name_ar: string
          full_name_en: string | null
          id: string
          notes: string | null
          phone: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string | null
        }
        Insert: {
          branch_slug?: string | null
          created_at?: string
          email: string
          father_lineage?: string | null
          full_name_ar: string
          full_name_en?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string | null
        }
        Update: {
          branch_slug?: string | null
          created_at?: string
          email?: string
          father_lineage?: string | null
          full_name_ar?: string
          full_name_en?: string | null
          id?: string
          notes?: string | null
          phone?: string | null
          review_note?: string | null
          reviewed_at?: string | null
          reviewed_by?: string | null
          status?: Database["public"]["Enums"]["request_status"]
          updated_at?: string
          user_id?: string | null
        }
        Relationships: []
      }
      navigation_items: {
        Row: {
          created_at: string
          icon: string | null
          id: string
          label_ar: string
          label_en: string | null
          menu_id: string
          parent_id: string | null
          sort_order: number
          target: string
          type: string
          updated_at: string
          url: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }
        Insert: {
          created_at?: string
          icon?: string | null
          id?: string
          label_ar: string
          label_en?: string | null
          menu_id: string
          parent_id?: string | null
          sort_order?: number
          target?: string
          type?: string
          updated_at?: string
          url: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Update: {
          created_at?: string
          icon?: string | null
          id?: string
          label_ar?: string
          label_en?: string | null
          menu_id?: string
          parent_id?: string | null
          sort_order?: number
          target?: string
          type?: string
          updated_at?: string
          url?: string
          visibility?: Database["public"]["Enums"]["visibility_level"]
        }
        Relationships: [
          {
            foreignKeyName: "navigation_items_menu_id_fkey"
            columns: ["menu_id"]
            isOneToOne: false
            referencedRelation: "navigation_menus"
            referencedColumns: ["id"]
          },
          {
            foreignKeyName: "navigation_items_parent_id_fkey"
            columns: ["parent_id"]
            isOneToOne: false
            referencedRelation: "navigation_items"
            referencedColumns: ["id"]
          },
        ]
      }
      navigation_menus: {
        Row: {
          code: string
          created_at: string
          id: string
          name_ar: string
          name_en: string | null
        }
        Insert: {
          code: string
          created_at?: string
          id?: string
          name_ar: string
          name_en?: string | null
        }
        Update: {
          code?: string
          created_at?: string
          id?: string
          name_ar?: string
          name_en?: string | null
        }
        Relationships: []
      }
      news_posts: {
        Row: {
          body_ar: string | null
          body_en: string | null
          cover_path: string | null
          created_at: string
          created_by: string | null
          excerpt_ar: string | null
          excerpt_en: string | null
          gregorian_date: string | null
          hijri_date: string | null
          id: string
          is_published: boolean
          published_at: string | null
          section: string
          slug: string
          sort_order: number
          title_ar: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          body_ar?: string | null
          body_en?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          gregorian_date?: string | null
          hijri_date?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          section?: string
          slug: string
          sort_order?: number
          title_ar: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          body_ar?: string | null
          body_en?: string | null
          cover_path?: string | null
          created_at?: string
          created_by?: string | null
          excerpt_ar?: string | null
          excerpt_en?: string | null
          gregorian_date?: string | null
          hijri_date?: string | null
          id?: string
          is_published?: boolean
          published_at?: string | null
          section?: string
          slug?: string
          sort_order?: number
          title_ar?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      newsletter_subscribers: {
        Row: {
          created_at: string
          email: string
          id: string
          is_active: boolean
          locale: string
          name: string | null
          updated_at: string
        }
        Insert: {
          created_at?: string
          email: string
          id?: string
          is_active?: boolean
          locale?: string
          name?: string | null
          updated_at?: string
        }
        Update: {
          created_at?: string
          email?: string
          id?: string
          is_active?: boolean
          locale?: string
          name?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      notification_preferences: {
        Row: {
          articles_news: boolean
          contributions: boolean
          created_at: string
          email_notifications: boolean
          family_events: boolean
          in_app_notifications: boolean
          lineage_updates: boolean
          system_alerts: boolean
          updated_at: string
          user_id: string
        }
        Insert: {
          articles_news?: boolean
          contributions?: boolean
          created_at?: string
          email_notifications?: boolean
          family_events?: boolean
          in_app_notifications?: boolean
          lineage_updates?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id: string
        }
        Update: {
          articles_news?: boolean
          contributions?: boolean
          created_at?: string
          email_notifications?: boolean
          family_events?: boolean
          in_app_notifications?: boolean
          lineage_updates?: boolean
          system_alerts?: boolean
          updated_at?: string
          user_id?: string
        }
        Relationships: []
      }
      notifications: {
        Row: {
          created_at: string
          id: string
          is_read: boolean
          link: string | null
          message_ar: string
          message_en: string | null
          title_ar: string
          title_en: string | null
          type: string
          user_id: string
        }
        Insert: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message_ar: string
          message_en?: string | null
          title_ar: string
          title_en?: string | null
          type: string
          user_id: string
        }
        Update: {
          created_at?: string
          id?: string
          is_read?: boolean
          link?: string | null
          message_ar?: string
          message_en?: string | null
          title_ar?: string
          title_en?: string | null
          type?: string
          user_id?: string
        }
        Relationships: []
      }
      permissions: {
        Row: {
          category: string
          created_at: string
          description: string | null
          id: string
          name: string
        }
        Insert: {
          category?: string
          created_at?: string
          description?: string | null
          id: string
          name: string
        }
        Update: {
          category?: string
          created_at?: string
          description?: string | null
          id?: string
          name?: string
        }
        Relationships: []
      }
      places: {
        Row: {
          address: string | null
          city: string | null
          country: string
          created_at: string
          description_ar: string | null
          description_en: string | null
          id: string
          latitude: number | null
          longitude: number | null
          media_path: string | null
          name_ar: string
          name_en: string | null
          region: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          media_path?: string | null
          name_ar: string
          name_en?: string | null
          region?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          city?: string | null
          country?: string
          created_at?: string
          description_ar?: string | null
          description_en?: string | null
          id?: string
          latitude?: number | null
          longitude?: number | null
          media_path?: string | null
          name_ar?: string
          name_en?: string | null
          region?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      profiles: {
        Row: {
          address: string | null
          avatar_path: string | null
          branch_slug: string | null
          city: string | null
          created_at: string
          display_name: string | null
          education_level: string | null
          email: string | null
          full_name_ar: string | null
          full_name_en: string | null
          id: string
          phone: string | null
          show_in_directory: boolean
          status: Database["public"]["Enums"]["user_status"] | null
          timezone: string | null
          updated_at: string
        }
        Insert: {
          address?: string | null
          avatar_path?: string | null
          branch_slug?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          email?: string | null
          full_name_ar?: string | null
          full_name_en?: string | null
          id: string
          phone?: string | null
          show_in_directory?: boolean
          status?: Database["public"]["Enums"]["user_status"] | null
          timezone?: string | null
          updated_at?: string
        }
        Update: {
          address?: string | null
          avatar_path?: string | null
          branch_slug?: string | null
          city?: string | null
          created_at?: string
          display_name?: string | null
          education_level?: string | null
          email?: string | null
          full_name_ar?: string | null
          full_name_en?: string | null
          id?: string
          phone?: string | null
          show_in_directory?: boolean
          status?: Database["public"]["Enums"]["user_status"] | null
          timezone?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      role_permissions: {
        Row: {
          created_at: string
          id: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Insert: {
          created_at?: string
          id?: string
          permission_id: string
          role: Database["public"]["Enums"]["app_role"]
        }
        Update: {
          created_at?: string
          id?: string
          permission_id?: string
          role?: Database["public"]["Enums"]["app_role"]
        }
        Relationships: [
          {
            foreignKeyName: "role_permissions_permission_id_fkey"
            columns: ["permission_id"]
            isOneToOne: false
            referencedRelation: "permissions"
            referencedColumns: ["id"]
          },
        ]
      }
      services: {
        Row: {
          category: string
          created_at: string
          created_by: string | null
          description_ar: string | null
          description_en: string | null
          id: string
          is_published: boolean
          slug: string
          sort_order: number
          title_ar: string
          title_en: string | null
          updated_at: string
        }
        Insert: {
          category: string
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean
          slug: string
          sort_order?: number
          title_ar: string
          title_en?: string | null
          updated_at?: string
        }
        Update: {
          category?: string
          created_at?: string
          created_by?: string | null
          description_ar?: string | null
          description_en?: string | null
          id?: string
          is_published?: boolean
          slug?: string
          sort_order?: number
          title_ar?: string
          title_en?: string | null
          updated_at?: string
        }
        Relationships: []
      }
      site_settings: {
        Row: {
          category: string
          id: string
          is_public: boolean
          key: string
          updated_at: string
          updated_by: string | null
          value: Json
        }
        Insert: {
          category?: string
          id?: string
          is_public?: boolean
          key: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Update: {
          category?: string
          id?: string
          is_public?: boolean
          key?: string
          updated_at?: string
          updated_by?: string | null
          value?: Json
        }
        Relationships: []
      }
      site_visit_counters: {
        Row: {
          key: string
          total_count: number
          updated_at: string
        }
        Insert: {
          key?: string
          total_count?: number
          updated_at?: string
        }
        Update: {
          key?: string
          total_count?: number
          updated_at?: string
        }
        Relationships: []
      }
      site_visit_sessions: {
        Row: {
          created_at: string
          last_counted_at: string
          visit_key: string
        }
        Insert: {
          created_at?: string
          last_counted_at?: string
          visit_key: string
        }
        Update: {
          created_at?: string
          last_counted_at?: string
          visit_key?: string
        }
        Relationships: []
      }
      user_roles: {
        Row: {
          created_at: string
          granted_by: string | null
          id: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Insert: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role: Database["public"]["Enums"]["app_role"]
          user_id: string
        }
        Update: {
          created_at?: string
          granted_by?: string | null
          id?: string
          role?: Database["public"]["Enums"]["app_role"]
          user_id?: string
        }
        Relationships: []
      }
    }
    Views: {
      [_ in never]: never
    }
    Functions: {
      family_public_stats: { Args: never; Returns: Json }
      record_site_visit: { Args: { p_visit_key: string }; Returns: number }
      replace_content_page_sections: {
        Args: { p_page_id: string; p_sections: Json }
        Returns: {
          created_at: string
          data: Json
          id: string
          page_id: string
          settings: Json
          sort_order: number
          type: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }[]
        SetofOptions: {
          from: "*"
          to: "content_sections"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      restore_content_revision: {
        Args: { p_revision_id: string }
        Returns: {
          created_at: string
          data: Json
          id: string
          page_id: string
          settings: Json
          sort_order: number
          type: string
          updated_at: string
          visibility: Database["public"]["Enums"]["visibility_level"]
        }[]
        SetofOptions: {
          from: "*"
          to: "content_sections"
          isOneToOne: false
          isSetofReturn: true
        }
      }
      review_membership_request_as_admin: {
        Args: {
          p_actor_id: string
          p_request_id: string
          p_review_note: string
          p_status: string
        }
        Returns: {
          branch_slug: string | null
          created_at: string
          email: string
          father_lineage: string | null
          full_name_ar: string
          full_name_en: string | null
          id: string
          notes: string | null
          phone: string | null
          review_note: string | null
          reviewed_at: string | null
          reviewed_by: string | null
          status: Database["public"]["Enums"]["request_status"]
          updated_at: string
          user_id: string | null
        }
        SetofOptions: {
          from: "*"
          to: "membership_requests"
          isOneToOne: true
          isSetofReturn: false
        }
      }
    }
    Enums: {
      app_role:
        | "admin"
        | "editor"
        | "treasurer"
        | "member"
        | "super_admin"
        | "content_manager"
        | "family_manager"
        | "viewer"
      contribution_status: "pending" | "verified" | "rejected"
      gender: "male" | "female"
      message_status: "new" | "read" | "archived"
      record_status:
        | "draft"
        | "in_review"
        | "scheduled"
        | "published"
        | "archived"
      relationship_type: "parent" | "child" | "spouse"
      request_status: "pending" | "approved" | "rejected"
      user_status: "ACTIVE" | "INVITED" | "SUSPENDED" | "DISABLED"
      visibility_level: "public" | "family_only" | "admin_only" | "private"
    }
    CompositeTypes: {
      [_ in never]: never
    }
  }
}

type DatabaseWithoutInternals = Omit<Database, "__InternalSupabase">

type DefaultSchema = DatabaseWithoutInternals[Extract<keyof Database, "public">]

export type Tables<
  DefaultSchemaTableNameOrOptions extends
    | keyof (DefaultSchema["Tables"] & DefaultSchema["Views"])
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
        DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? (DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"] &
      DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Views"])[TableName] extends {
      Row: infer R
    }
    ? R
    : never
  : DefaultSchemaTableNameOrOptions extends keyof (DefaultSchema["Tables"] &
        DefaultSchema["Views"])
    ? (DefaultSchema["Tables"] &
        DefaultSchema["Views"])[DefaultSchemaTableNameOrOptions] extends {
        Row: infer R
      }
      ? R
      : never
    : never

export type TablesInsert<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Insert: infer I
    }
    ? I
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Insert: infer I
      }
      ? I
      : never
    : never

export type TablesUpdate<
  DefaultSchemaTableNameOrOptions extends
    | keyof DefaultSchema["Tables"]
    | { schema: keyof DatabaseWithoutInternals },
  TableName extends (DefaultSchemaTableNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"]
    : never) = never,
> = DefaultSchemaTableNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaTableNameOrOptions["schema"]]["Tables"][TableName] extends {
      Update: infer U
    }
    ? U
    : never
  : DefaultSchemaTableNameOrOptions extends keyof DefaultSchema["Tables"]
    ? DefaultSchema["Tables"][DefaultSchemaTableNameOrOptions] extends {
        Update: infer U
      }
      ? U
      : never
    : never

export type Enums<
  DefaultSchemaEnumNameOrOptions extends
    | keyof DefaultSchema["Enums"]
    | { schema: keyof DatabaseWithoutInternals },
  EnumName extends (DefaultSchemaEnumNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"]
    : never) = never,
> = DefaultSchemaEnumNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[DefaultSchemaEnumNameOrOptions["schema"]]["Enums"][EnumName]
  : DefaultSchemaEnumNameOrOptions extends keyof DefaultSchema["Enums"]
    ? DefaultSchema["Enums"][DefaultSchemaEnumNameOrOptions]
    : never

export type CompositeTypes<
  PublicCompositeTypeNameOrOptions extends
    | keyof DefaultSchema["CompositeTypes"]
    | { schema: keyof DatabaseWithoutInternals },
  CompositeTypeName extends (PublicCompositeTypeNameOrOptions extends {
    schema: keyof DatabaseWithoutInternals
  }
    ? keyof DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
    : never) = never,
> = PublicCompositeTypeNameOrOptions extends {
  schema: keyof DatabaseWithoutInternals
}
  ? DatabaseWithoutInternals[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
  : PublicCompositeTypeNameOrOptions extends keyof DefaultSchema["CompositeTypes"]
    ? DefaultSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
    : never

export const Constants = {
  public: {
    Enums: {
      app_role: [
        "admin",
        "editor",
        "treasurer",
        "member",
        "super_admin",
        "content_manager",
        "family_manager",
        "viewer",
      ],
      contribution_status: ["pending", "verified", "rejected"],
      gender: ["male", "female"],
      message_status: ["new", "read", "archived"],
      record_status: [
        "draft",
        "in_review",
        "scheduled",
        "published",
        "archived",
      ],
      relationship_type: ["parent", "child", "spouse"],
      request_status: ["pending", "approved", "rejected"],
      user_status: ["ACTIVE", "INVITED", "SUSPENDED", "DISABLED"],
      visibility_level: ["public", "family_only", "admin_only", "private"],
    },
  },
} as const
