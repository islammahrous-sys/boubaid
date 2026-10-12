export type EmailPriority = "CRITICAL" | "HIGH" | "NORMAL" | "LOW";

export type EmailDeliveryStatus =
  | "queued"
  | "processing"
  | "sent"
  | "delivered"
  | "bounced"
  | "failed"
  | "complained"
  | "cancelled";

export type EmailLanguage = "ar" | "en";

export type EmailCategory =
  | "auth"
  | "membership"
  | "requests"
  | "committees"
  | "council"
  | "events"
  | "fund"
  | "news"
  | "newsletter"
  | "system";

export type EmailTemplateKey =
  | "auth_welcome"
  | "auth_verify_email"
  | "auth_email_verification"
  | "auth_password_reset"
  | "auth_password_changed"
  | "auth_email_changed"
  | "auth_new_login"
  | "auth_security_alert"
  | "auth_account_activated"
  | "auth_account_suspended"
  | "auth_account_restored"
  | "auth_profile_updated"
  | "membership_application_received"
  | "membership_under_review"
  | "membership_approved"
  | "membership_rejected"
  | "membership_requires_correction"
  | "membership_renewed"
  | "membership_expired"
  | "membership_status_changed"
  | "membership_document_uploaded"
  | "membership_document_approved"
  | "membership_document_rejected"
  | "request_submitted"
  | "request_received_by_committee"
  | "request_assigned"
  | "request_under_review"
  | "request_requires_info"
  | "request_approved"
  | "request_rejected"
  | "request_completed"
  | "request_cancelled"
  | "request_reopened"
  | "request_comment_added"
  | "request_status_changed"
  | "committee_assignment"
  | "committee_request_received"
  | "committee_action_required"
  | "committee_decision_recorded"
  | "committee_meeting_notification"
  | "committee_meeting_reminder"
  | "committee_announcement"
  | "event_new_announcement"
  | "event_registration_confirmed"
  | "event_registration_cancelled"
  | "event_reminder"
  | "event_updated"
  | "event_cancelled"
  | "event_location_changed"
  | "event_post_notification"
  | "fund_project_update"
  | "fund_development_project_announced"
  | "news_family_announcement"
  | "news_official_announcement"
  | "news_article_published"
  | "news_archive_document_released"
  | "news_heritage_collection_released"
  | "newsletter_family_edition"
  | "newsletter_monthly_update"
  | "newsletter_special_bulletin"
  | "newsletter_event_digest"
  | "system_notification"
  | "system_workflow_failed"
  | "system_delivery_failure"
  | "system_admin_alert"
  | "system_scheduled_notification";

export interface EmailLogRow {
  id: string;
  notification_id?: string | null;
  user_id?: string | null;
  recipient_email: string;
  recipient_name?: string | null;
  email_type: string;
  category: EmailCategory;
  priority: EmailPriority;
  language: EmailLanguage;
  subject: string;
  html_body?: string | null;
  text_body?: string | null;
  status: EmailDeliveryStatus;
  provider: string;
  provider_message_id?: string | null;
  payload: Record<string, any>;
  attempts: number;
  max_attempts: number;
  error_message?: string | null;
  idempotency_key?: string | null;
  scheduled_at: string;
  sent_at?: string | null;
  delivered_at?: string | null;
  failed_at?: string | null;
  opened_at?: string | null;
  clicked_at?: string | null;
  created_at: string;
  updated_at: string;
}

export type EmailLogRecord = EmailLogRow;

export interface EmailTemplateRow {
  id: string;
  template_key: string;
  category: EmailCategory;
  name_ar: string;
  name_en: string;
  description_ar?: string | null;
  description_en?: string | null;
  subject_template_ar: string;
  subject_template_en: string;
  body_template_ar?: string | null;
  body_template_en?: string | null;
  available_variables: string[];
  default_priority: EmailPriority;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface EmailStatistics {
  total: number;
  queued: number;
  processing: number;
  sent: number;
  delivered: number;
  bounced: number;
  failed: number;
  complained: number;
  critical_count: number;
  high_count: number;
}

export interface EnqueueEmailParams {
  userId?: string | null;
  recipientEmail: string;
  recipientName?: string | null;
  emailType?: string;
  templateKey?: string;
  category?: EmailCategory;
  priority?: EmailPriority;
  language?: EmailLanguage;
  subject?: string;
  variables?: Record<string, any>;
  actionUrl?: string;
  actionLabel?: string;
  idempotencyKey?: string;
  scheduledAt?: Date;
  bypassPreferences?: boolean;
}
