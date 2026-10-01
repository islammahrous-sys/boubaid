import type { EmailLanguage } from "./email-types";

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}

export function renderGreeting(name?: string | null, language: EmailLanguage = "ar"): string {
  const isAr = language === "ar";
  const salutation = isAr ? "السلام عليكم ورحمة الله وبركاته" : "Dear";
  const displayName = name ? escapeXml(name) : isAr ? "الكريم" : "Member";

  if (isAr) {
    return `<div class="greeting">${salutation}،<br><span style="font-size:15px;color:#736053;font-weight:normal;">الأخ / الأخت: <strong>${displayName}</strong> المحترم،</span></div>`;
  }
  return `<div class="greeting">${salutation} <strong>${displayName}</strong>,</div>`;
}

export function renderTitle(title: string): string {
  return `<h1 class="h1">${escapeXml(title)}</h1>`;
}

export function renderParagraph(text: string): string {
  return `<p class="paragraph">${escapeXml(text)}</p>`;
}

export function renderInformationCard(contentHtml: string): string {
  return `<div class="card">${contentHtml}</div>`;
}

export function renderStatusBadge(
  status: string,
  label: string,
  variant: "success" | "warning" | "info" | "danger" = "info",
): string {
  return `<span class="badge badge-${variant}">${escapeXml(label)}</span>`;
}

export interface DetailRow {
  label: string;
  value: string;
  isBadge?: boolean;
  badgeVariant?: "success" | "warning" | "info" | "danger";
}

export function renderDetailsTable(rows: DetailRow[], language: EmailLanguage = "ar"): string {
  const renderedRows = rows
    .filter((r) => Boolean(r.value))
    .map((r) => {
      const valHtml = r.isBadge
        ? renderStatusBadge(r.value, r.value, r.badgeVariant || "info")
        : escapeXml(r.value);
      return `<tr>
        <td class="label">${escapeXml(r.label)}:</td>
        <td class="val">${valHtml}</td>
      </tr>`;
    })
    .join("");

  return `<table class="data-table" role="presentation">${renderedRows}</table>`;
}

export function renderActionButton(
  url: string,
  label: string,
  language: EmailLanguage = "ar",
): string {
  return `<div class="btn-wrap">
    <!--[if mso]>
    <v:roundrect xmlns:v=\"urn:schemas-microsoft-com:vml\" xmlns:w=\"urn:schemas-microsoft-com:office:word\" href=\"${url}\" style=\"height:46px;v-text-anchor:middle;width:240px;\" arcsize=\"14%\" fillcolor=\"#245B3F\" stroke=\"f\">
      <w:anchorlock/>
      <center style=\"color:#ffffff;font-family:sans-serif;font-size:15px;font-weight:bold;\">${escapeXml(label)}</center>
    </v:roundrect>
    <![endif]-->
    <!--[if !mso]><!-->
    <a href="${url}" class="btn-primary" target="_blank">${escapeXml(label)}</a>
    <!--<![endif]-->
  </div>`;
}

export function renderSecondaryButton(
  url: string,
  label: string,
  language: EmailLanguage = "ar",
): string {
  return `<a href="${url}" class="btn-secondary" target="_blank">${escapeXml(label)}</a>`;
}

export function renderAlertBox(
  message: string,
  type: "critical" | "info" = "info",
  title?: string,
): string {
  const boxClass = type === "critical" ? "alert-critical" : "alert-info";
  return `<div class="alert-box ${boxClass}">
    ${title ? `<div style="font-weight:700;margin-bottom:6px;">${escapeXml(title)}</div>` : ""}
    <div>${escapeXml(message)}</div>
  </div>`;
}

export function renderDivider(): string {
  return `<hr class="divider">`;
}

export function renderTrackingTroubleNotice(url: string, language: EmailLanguage = "ar"): string {
  const isAr = language === "ar";
  return `<div style="margin-top:24px;font-size:12px;color:#736053;line-height:1.5;">
    ${
      isAr
        ? `إذا واجهت صعوبة في النقر على الزر أعلاه، يمكنك نسخ الرابط المباشر ولصقه في متصفحك:`
        : `If you have trouble clicking the button above, copy and paste this link into your browser:`
    }
    <br>
    <a href="${url}" target="_blank" style="color:#245B3F;word-break:break-all;text-decoration:underline;">${url}</a>
  </div>`;
}
