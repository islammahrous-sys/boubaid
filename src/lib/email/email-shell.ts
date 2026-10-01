import type { EmailLanguage } from "./email-types";

export interface EmailShellOptions {
  language: EmailLanguage;
  title: string;
  preheader: string;
  badgeText?: string;
  contentHtml: string;
  isNewsletter?: boolean;
  unsubscribeUrl?: string;
}

/**
 * Enterprise-grade responsive HTML email shell for Al Bu Obaid Family Portal.
 * Uses official brand guidelines (دليل الهوية البصرية):
 * - Deep Heritage Green (#245B3F) & Deep Brown (#774932)
 * - Brand Gold (#ECA654)
 * - Warm Paper (#FFF4E9)
 * - Full Arabic RTL / English LTR typography and layout alignment.
 * - Microsoft Outlook VML fallbacks.
 */
export function wrapInEmailShell(options: EmailShellOptions): string {
  const isAr = options.language === "ar";
  const dir = isAr ? "rtl" : "ltr";
  const lang = options.language;
  const textAlign = isAr ? "right" : "left";
  const oppositeAlign = isAr ? "left" : "right";

  const councilName = isAr ? "مجلس أسرة آل بوعبيد" : "Al Bu Obaid Family Council";
  const fundName = isAr ? "صندوق التنمية العائلية" : "Family Development Fund";
  const siteUrl = "https://www.boubaid.com";
  const supportEmail = "team@boubaid.com";
  const year = new Date().getFullYear();

  const fontStack = isAr
    ? "'Amiri', 'IBM Plex Sans Arabic', Tahoma, Arial, sans-serif"
    : "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif";

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${dir}" xmlns="http://www.w3.org/1999/xhtml" xmlns:v="urn:schemas-microsoft-com:vml" xmlns:o="urn:schemas-microsoft-com:office:office">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <meta name="x-apple-disable-message-reformatting">
  <meta name="color-scheme" content="light dark">
  <meta name="supported-color-schemes" content="light dark">
  <title>${escapeXml(options.title)}</title>
  <!--[if mso]>
  <noscript>
    <xml>
      <o:OfficeDocumentSettings>
        <o:AllowPNG/>
        <o:PixelsPerInch>96</o:PixelsPerInch>
      </o:OfficeDocumentSettings>
    </xml>
  </noscript>
  <![endif]-->
  <style>
    :root {
      color-scheme: light dark;
      supported-color-schemes: light dark;
    }
    body {
      margin: 0;
      padding: 0;
      width: 100% !important;
      -webkit-text-size-adjust: 100%;
      -ms-text-size-adjust: 100%;
      background-color: #FFF4E9;
      font-family: ${fontStack};
      color: #1B110B;
      line-height: 1.6;
    }
    table, td {
      border-collapse: collapse;
      mso-table-lspace: 0pt;
      mso-table-rspace: 0pt;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      -ms-interpolation-mode: bicubic;
    }
    .wrapper {
      width: 100%;
      background-color: #FFF4E9;
      padding: 40px 0;
    }
    .container {
      max-width: 620px;
      margin: 0 auto;
      background-color: #FFFFFF;
      border-radius: 12px;
      border: 1px solid #E8DCD1;
      overflow: hidden;
      box-shadow: 0 4px 20px rgba(119, 73, 50, 0.08);
    }
    .header {
      background: linear-gradient(135deg, #1B4430 0%, #245B3F 50%, #307553 100%);
      padding: 36px 32px 30px;
      text-align: center;
      border-bottom: 3px solid #ECA654;
    }
    .header-logo {
      height: 52px;
      max-height: 52px;
      width: auto;
      display: inline-block;
    }
    .header-title {
      margin: 14px 0 2px;
      color: #FFFFFF;
      font-size: 19px;
      font-weight: 700;
      letter-spacing: 0.2px;
    }
    .header-subtitle {
      margin: 0;
      color: #ECA654;
      font-size: 13px;
      font-weight: 500;
    }
    .header-badge {
      display: inline-block;
      margin-top: 14px;
      padding: 4px 14px;
      background: rgba(236, 166, 84, 0.18);
      border: 1px solid rgba(236, 166, 84, 0.4);
      border-radius: 9999px;
      color: #FFFFFF;
      font-size: 11px;
      font-weight: 600;
      letter-spacing: 0.5px;
    }
    .content {
      padding: 36px 36px 28px;
      text-align: ${textAlign};
      direction: ${dir};
    }
    .h1 {
      color: #245B3F;
      font-size: 22px;
      font-weight: 700;
      margin: 0 0 16px;
      line-height: 1.35;
    }
    .greeting {
      font-size: 16px;
      color: #1B110B;
      font-weight: 600;
      margin: 0 0 16px;
    }
    .paragraph {
      font-size: 15px;
      color: #382A21;
      margin: 0 0 20px;
      line-height: 1.7;
    }
    .card {
      background-color: #FAF6F0;
      border: 1px solid #EADBCE;
      border-${isAr ? "right" : "left"}: 4px solid #ECA654;
      border-radius: 8px;
      padding: 20px 24px;
      margin: 24px 0;
    }
    .data-table {
      width: 100%;
      margin: 16px 0;
      border-collapse: separate;
      border-spacing: 0;
    }
    .data-table tr {
      border-bottom: 1px solid #EADBCE;
    }
    .data-table td {
      padding: 10px 12px;
      font-size: 14px;
      text-align: ${textAlign};
    }
    .data-table .label {
      color: #736053;
      font-weight: 600;
      width: 36%;
    }
    .data-table .val {
      color: #1B110B;
      font-weight: 700;
    }
    .badge {
      display: inline-block;
      padding: 4px 12px;
      border-radius: 6px;
      font-size: 12px;
      font-weight: 700;
    }
    .badge-success { background: #E6F4EA; color: #1E6B37; border: 1px solid #CEEAD6; }
    .badge-warning { background: #FEF7E0; color: #B06000; border: 1px solid #FEEFC3; }
    .badge-info { background: #E8F0FE; color: #1A56DB; border: 1px solid #D2E3FC; }
    .badge-danger { background: #FCE8E6; color: #C5221F; border: 1px solid #FAD2CF; }
    .btn-wrap {
      margin: 30px 0;
      text-align: ${textAlign};
    }
    .btn-primary {
      display: inline-block;
      background: linear-gradient(135deg, #245B3F 0%, #1B4430 100%);
      color: #FFFFFF !important;
      font-weight: 700;
      text-decoration: none;
      padding: 14px 34px;
      border-radius: 6px;
      font-size: 15px;
      border: 1px solid #1B4430;
      box-shadow: 0 2px 8px rgba(36, 91, 63, 0.25);
    }
    .btn-secondary {
      display: inline-block;
      background: #FFFFFF;
      color: #245B3F !important;
      font-weight: 600;
      text-decoration: none;
      padding: 12px 28px;
      border-radius: 6px;
      font-size: 14px;
      border: 1px solid #245B3F;
      margin-${isAr ? "right" : "left"}: 10px;
    }
    .divider {
      border: none;
      border-top: 1px solid #EADBCE;
      margin: 28px 0;
    }
    .alert-box {
      border-radius: 8px;
      padding: 16px 20px;
      margin: 20px 0;
      font-size: 14px;
      line-height: 1.6;
    }
    .alert-critical {
      background: #FDF2F2;
      border: 1px solid #F8B4B4;
      color: #9B1C1C;
    }
    .alert-info {
      background: #F0FDF4;
      border: 1px solid #BBF7D0;
      color: #166534;
    }
    .footer {
      background: #1B110B;
      padding: 32px 32px 28px;
      text-align: center;
      color: rgba(255, 255, 255, 0.75);
      border-top: 3px solid #ECA654;
    }
    .footer-title {
      color: #ECA654;
      font-size: 14px;
      font-weight: 700;
      margin: 0 0 4px;
    }
    .footer-subtitle {
      color: rgba(255, 255, 255, 0.6);
      font-size: 12px;
      margin: 0 0 16px;
    }
    .footer-links {
      margin: 14px 0;
    }
    .footer-links a {
      color: #FFFFFF;
      text-decoration: none;
      font-size: 12px;
      margin: 0 10px;
      font-weight: 600;
    }
    .footer-copy {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.45);
      margin: 16px 0 0;
      line-height: 1.5;
    }
    .unsub-text {
      font-size: 11px;
      color: rgba(255, 255, 255, 0.5);
      margin-top: 12px;
    }
    .unsub-text a {
      color: #ECA654;
      text-decoration: underline;
    }
    @media only screen and (max-width: 620px) {
      .wrapper { padding: 12px 6px !important; }
      .container { border-radius: 8px !important; }
      .content { padding: 24px 18px !important; }
      .header { padding: 26px 18px !important; }
      .footer { padding: 24px 18px !important; }
      .h1 { font-size: 19px !important; }
      .btn-primary { display: block !important; width: 100% !important; box-sizing: border-box !important; text-align: center !important; }
    }
  </style>
</head>
<body>
  <!-- Preheader text hidden in body but shown in email client previews -->
  <div style="display:none!important;visibility:hidden;mso-hide:all;font-size:1px;line-height:1px;max-height:0;max-width:0;opacity:0;overflow:hidden;">
    ${escapeXml(options.preheader)} &zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;&zwnj;&nbsp;
  </div>

  <div class="wrapper">
    <!--[if mso]>
    <table role="presentation" width="620" cellpadding="0" cellspacing="0" border="0" align="center" style="width:620px;">
    <tr>
    <td>
    <![endif]-->

    <div class="container">
      <!-- HEADER -->
      <div class="header">
        <a href="${siteUrl}" target="_blank" style="text-decoration:none;">
          <img src="${siteUrl}/logo-mark-cream.svg" alt="${escapeXml(councilName)}" class="header-logo" width="52" height="52">
        </a>
        <div class="header-title">${escapeXml(councilName)}</div>
        <div class="header-subtitle">${escapeXml(fundName)}</div>
        ${options.badgeText ? `<div class="header-badge">${escapeXml(options.badgeText)}</div>` : ""}
      </div>

      <!-- BODY CONTENT -->
      <div class="content">
        ${options.contentHtml}
      </div>

      <!-- FOOTER -->
      <div class="footer">
        <div class="footer-title">${escapeXml(councilName)}</div>
        <div class="footer-subtitle">${escapeXml(fundName)} &bull; ${isAr ? "المملكة العربية السعودية — الأحساء" : "Kingdom of Saudi Arabia — Al-Ahsa"}</div>
        <div class="footer-links">
          <a href="${siteUrl}" target="_blank">${isAr ? "البوابة الرسمية" : "Official Portal"}</a> &bull;
          <a href="${siteUrl}/requests" target="_blank">${isAr ? "مركز الطلبات" : "Request Hub"}</a> &bull;
          <a href="mailto:${supportEmail}">${supportEmail}</a>
        </div>
        <p class="footer-copy">&copy; ${year} ${escapeXml(councilName)}. ${isAr ? "جميع الحقوق محفوظة." : "All rights reserved."}</p>
        ${
          options.isNewsletter && options.unsubscribeUrl
            ? `<p class="unsub-text">${
                isAr
                  ? `تصلك هذه النشرة بصفتك أحد أفراد الأسرة المسجلين. يمكنك <a href="${options.unsubscribeUrl}">إلغاء الاشتراك من النشرة البريدية</a> في أي وقت.`
                  : `You are receiving this bulletin as a registered family member. You may <a href="${options.unsubscribeUrl}">unsubscribe from family newsletters</a> at any time.`
              }</p>`
            : ""
        }
      </div>
    </div>

    <!--[if mso]>
    </td>
    </tr>
    </table>
    <![endif]-->
  </div>
</body>
</html>`;
}

function escapeXml(str: string): string {
  if (!str) return "";
  return str
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
}
