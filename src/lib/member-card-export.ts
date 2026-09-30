/**
 * Renders the digital member card (front + back) onto a high-resolution
 * canvas and exports it as PNG or a two-page PDF. Drawing directly with the
 * Canvas API (instead of screenshotting the DOM) gives crisp, identical output
 * on every device. Browser-only: import dynamically from event handlers.
 */
import QRCode from "qrcode";

export interface MemberCardData {
  lang: "ar" | "en";
  nameAr: string;
  nameEn?: string;
  branch: string;
  memberCode: string;
  issued: string;
  avatarUrl?: string | null;
  verifyUrl: string;
}

// ID-1 card ratio (85.6 × 54 mm) at ~600 dpi.
const W = 2024;
const H = 1276;
const GREEN = "#122A22";
const GREEN_2 = "#1C3A2F";
const GOLD = "#C99B3C";
const IVORY = "#F6EFE0";
const FONT = '"IBM Plex Sans Arabic", "Noto Naskh Arabic", system-ui, sans-serif';

function loadImage(src: string): Promise<HTMLImageElement | null> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = () => resolve(null);
    img.src = src;
  });
}

function roundRect(ctx: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  ctx.beginPath();
  ctx.moveTo(x + r, y);
  ctx.arcTo(x + w, y, x + w, y + h, r);
  ctx.arcTo(x + w, y + h, x, y + h, r);
  ctx.arcTo(x, y + h, x, y, r);
  ctx.arcTo(x, y, x + w, y, r);
  ctx.closePath();
}

function base(ctx: CanvasRenderingContext2D, crest: HTMLImageElement | null) {
  const g = ctx.createLinearGradient(0, 0, W, H);
  g.addColorStop(0, GREEN_2);
  g.addColorStop(1, GREEN);
  roundRect(ctx, 0, 0, W, H, 64);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  if (crest) {
    ctx.globalAlpha = 0.07;
    const s = 1100;
    ctx.drawImage(crest, W / 2 - s / 2, H / 2 - s / 2, s, s);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 10;
  roundRect(ctx, 28, 28, W - 56, H - 56, 44);
  ctx.stroke();
  ctx.lineWidth = 2;
  ctx.globalAlpha = 0.6;
  roundRect(ctx, 52, 52, W - 104, H - 104, 32);
  ctx.stroke();
  ctx.globalAlpha = 1;
}

function text(
  ctx: CanvasRenderingContext2D,
  value: string,
  x: number,
  y: number,
  size: number,
  color: string,
  opts: { weight?: number; align?: CanvasTextAlign; rtl?: boolean; maxWidth?: number } = {},
) {
  ctx.font = `${opts.weight ?? 400} ${size}px ${FONT}`;
  ctx.fillStyle = color;
  ctx.textAlign = opts.align ?? "start";
  ctx.direction = opts.rtl ? "rtl" : "ltr";
  ctx.fillText(value, x, y, opts.maxWidth);
}

async function drawFront(d: MemberCardData, crest: HTMLImageElement | null) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  base(ctx, crest);
  const rtl = d.lang === "ar";
  const S = rtl ? W - 130 : 130; // start edge
  const E = rtl ? 130 : W - 130; // end edge
  const alignS: CanvasTextAlign = rtl ? "right" : "left";
  const alignE: CanvasTextAlign = rtl ? "left" : "right";

  if (crest) ctx.drawImage(crest, rtl ? W - 130 - 150 : 130, 110, 150, 150);
  const hx = rtl ? W - 130 - 180 : 310;
  text(ctx, rtl ? "مجلس أسرة آل بوعبيد" : "Al Bu Obaid Family Council", hx, 180, 64, GOLD, { weight: 700, align: alignS, rtl });
  text(ctx, rtl ? "بطاقة العضوية الرقمية" : "Digital Membership Card", hx, 245, 38, IVORY, { align: alignS, rtl });

  // status badge
  ctx.font = `700 34px ${FONT}`;
  const badge = rtl ? "عضو معتمد" : "VERIFIED MEMBER";
  const bw = ctx.measureText(badge).width + 70;
  const bx = rtl ? 130 : W - 130 - bw;
  roundRect(ctx, bx, 140, bw, 72, 36);
  ctx.fillStyle = GOLD;
  ctx.fill();
  text(ctx, badge, bx + bw / 2, 189, 34, GREEN, { weight: 700, align: "center", rtl });

  ctx.fillStyle = GOLD;
  ctx.fillRect(130, 320, W - 260, 3);

  // photo
  const px = rtl ? W - 130 - 360 : 130;
  const avatar = d.avatarUrl ? await loadImage(d.avatarUrl) : null;
  ctx.save();
  roundRect(ctx, px, 390, 360, 440, 36);
  ctx.fillStyle = "#0B1C16";
  ctx.fill();
  ctx.clip();
  if (avatar) {
    const r = Math.max(360 / avatar.width, 440 / avatar.height);
    const w = avatar.width * r;
    const h = avatar.height * r;
    ctx.drawImage(avatar, px + (360 - w) / 2, 390 + (440 - h) / 2, w, h);
  } else if (crest) {
    ctx.globalAlpha = 0.5;
    ctx.drawImage(crest, px + 60, 490, 240, 240);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  ctx.strokeStyle = GOLD;
  ctx.lineWidth = 6;
  roundRect(ctx, px, 390, 360, 440, 36);
  ctx.stroke();

  const ix = rtl ? px - 70 : px + 430;
  const label = (l: string, v: string, y: number, mono = false) => {
    text(ctx, l, ix, y, 30, "rgba(246,239,224,0.55)", { align: alignS, rtl });
    text(ctx, v, ix, y + 58, 46, mono ? IVORY : GOLD, { weight: 700, align: alignS, rtl: rtl && !mono, maxWidth: 820 });
  };
  text(ctx, rtl ? "اسم العضو" : "Member name", ix, 420, 30, "rgba(246,239,224,0.55)", { align: alignS, rtl });
  text(ctx, rtl ? d.nameAr : d.nameEn || d.nameAr, ix, 495, 64, IVORY, { weight: 700, align: alignS, rtl: rtl || !d.nameEn, maxWidth: 840 });
  const second = rtl ? d.nameEn : d.nameAr;
  if (second && second !== (rtl ? d.nameAr : d.nameEn)) {
    text(ctx, second, ix, 550, 34, "rgba(246,239,224,0.7)", { align: alignS, rtl: !rtl, maxWidth: 840 });
  }
  label(rtl ? "الفرع" : "Branch", d.branch, 620);
  label(rtl ? "رقم العضوية" : "Member ID", d.memberCode, 740, true);

  // QR
  const qr = await loadImage(
    await QRCode.toDataURL(d.verifyUrl, { margin: 1, width: 400, color: { dark: GREEN, light: "#ffffff" } }),
  );
  const qx = rtl ? 130 : W - 130 - 330;
  roundRect(ctx, qx, 440, 330, 330, 24);
  ctx.fillStyle = "#ffffff";
  ctx.fill();
  if (qr) ctx.drawImage(qr, qx + 15, 455, 300, 300);
  text(ctx, rtl ? "امسح للتحقق" : "Scan to verify", qx + 165, 820, 30, GOLD, { weight: 700, align: "center", rtl });

  ctx.fillStyle = "rgba(201,155,60,0.5)";
  ctx.fillRect(130, 1040, W - 260, 2);
  text(ctx, `${rtl ? "تاريخ الإصدار" : "Issued"}: ${d.issued}`, S, 1120, 32, "rgba(246,239,224,0.7)", { align: alignS, rtl });
  text(ctx, "NCNP LIC. #1200758400 · AL-AHSA, KSA", E, 1120, 30, "rgba(246,239,224,0.55)", { align: alignE });
  return c;
}

async function drawBack(d: MemberCardData, crest: HTMLImageElement | null) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d")!;
  base(ctx, crest);
  const rtl = d.lang === "ar";
  const S = rtl ? W - 150 : 150;
  const align: CanvasTextAlign = rtl ? "right" : "left";
  ctx.fillStyle = GOLD;
  ctx.fillRect(0, 150, W, 110);
  text(ctx, rtl ? "شروط العضوية" : "Membership terms", W / 2, 225, 52, GREEN, { weight: 700, align: "center", rtl });
  const terms = rtl
    ? [
        "هذه البطاقة شخصية وتخص حاملها المسجّل في سجل أسرة آل بوعبيد.",
        "تثبت العضوية فقط عند مسح رمز التحقق ومطابقته مع السجل الرسمي.",
        "تبقى البطاقة ملكاً لمجلس الأسرة ويحق له إيقافها أو إلغاؤها.",
        "عند فقدان البطاقة أو تغيّر البيانات يرجى إبلاغ الأمانة العامة.",
      ]
    : [
        "This card is personal to the member registered with the Al Bu Obaid family.",
        "Membership is proven only by scanning the QR code against the official record.",
        "The card remains the property of the Family Council and may be suspended.",
        "Report a lost card or changed details to the General Secretariat.",
      ];
  terms.forEach((t, i) => {
    const y = 380 + i * 110;
    ctx.beginPath();
    ctx.arc(rtl ? S - 12 : S + 12, y - 14, 12, 0, Math.PI * 2);
    ctx.fillStyle = GOLD;
    ctx.fill();
    text(ctx, t, rtl ? S - 50 : S + 50, y, 40, IVORY, { align, rtl, maxWidth: W - 360 });
  });
  ctx.fillStyle = "rgba(201,155,60,0.5)";
  ctx.fillRect(150, 850, W - 300, 2);
  text(ctx, rtl ? "الأمانة العامة لمجلس أسرة آل بوعبيد" : "General Secretariat, Al Bu Obaid Family Council", W / 2, 950, 44, GOLD, { weight: 700, align: "center", rtl });
  text(ctx, d.verifyUrl.replace(/^https?:\/\//, ""), W / 2, 1030, 32, "rgba(246,239,224,0.7)", { align: "center" });
  text(ctx, "NCNP License #1200758400 · Saudi Arabia · Al-Ahsa", W / 2, 1110, 30, "rgba(246,239,224,0.55)", { align: "center" });
  return c;
}

async function render(d: MemberCardData) {
  await document.fonts?.ready;
  const crest = await loadImage("/logo-mark-gold.svg");
  return Promise.all([drawFront(d, crest), drawBack(d, crest)]);
}

function save(href: string, name: string) {
  const a = document.createElement("a");
  a.href = href;
  a.download = name;
  document.body.appendChild(a);
  a.click();
  a.remove();
}

export async function exportCardPng(d: MemberCardData) {
  const [front, back] = await render(d);
  save(front.toDataURL("image/png"), `${d.memberCode}-front.png`);
  await new Promise((r) => setTimeout(r, 300));
  save(back.toDataURL("image/png"), `${d.memberCode}-back.png`);
}

export async function exportCardPdf(d: MemberCardData) {
  const [front, back] = await render(d);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: [85.6, 54] });
  pdf.addImage(front.toDataURL("image/png"), "PNG", 0, 0, 85.6, 54);
  pdf.addPage([85.6, 54], "landscape");
  pdf.addImage(back.toDataURL("image/png"), "PNG", 0, 0, 85.6, 54);
  pdf.save(`${d.memberCode}-card.pdf`);
}
