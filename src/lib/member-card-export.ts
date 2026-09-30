/**
 * Renders the digital member card (front + back) onto a high-resolution
 * canvas and exports both faces on one landscape PNG, PDF, or print sheet. Drawing directly with the
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
const CREAM = "#FDE7D6";
const CREAM_2 = "#FFF8F2";
const BROWN = "#78462A";
const CLAY = "#8B5433";
const COPPER = "#BE744A";
const GOLD = "#EDA746";
const GREEN = "#26583C";
const MUTED = "#9A725C";
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
  g.addColorStop(0, CREAM_2);
  g.addColorStop(1, CREAM);
  roundRect(ctx, 0, 0, W, H, 64);
  ctx.fillStyle = g;
  ctx.fill();
  ctx.save();
  ctx.clip();
  if (crest) {
    ctx.globalAlpha = 0.09;
    const s = 1020;
    ctx.drawImage(crest, W / 2 - s / 2, H / 2 - s / 2, s, s);
    ctx.globalAlpha = 1;
  }
  ctx.restore();
  ctx.strokeStyle = BROWN;
  ctx.lineWidth = 10;
  roundRect(ctx, 28, 28, W - 56, H - 56, 44);
  ctx.stroke();
  ctx.lineWidth = 3;
  ctx.globalAlpha = 0.75;
  ctx.strokeStyle = GOLD;
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
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  base(ctx, crest);
  const rtl = d.lang === "ar";
  const S = rtl ? W - 130 : 130; // start edge
  const E = rtl ? 130 : W - 130; // end edge
  const alignS: CanvasTextAlign = rtl ? "right" : "left";
  const alignE: CanvasTextAlign = rtl ? "left" : "right";

  if (crest) ctx.drawImage(crest, rtl ? W - 130 - 150 : 130, 110, 150, 150);
  const hx = rtl ? W - 130 - 180 : 310;
  text(ctx, rtl ? "مجلس أسرة آل بوعبيد" : "Al Bu Obaid Family Council", hx, 180, 64, GOLD, { weight: 700, align: alignS, rtl });
  text(ctx, rtl ? "بطاقة العضوية الرسمية" : "Official Membership Card", hx, 245, 38, CLAY, { align: alignS, rtl });

  // status badge
  ctx.font = `700 34px ${FONT}`;
  const badge = rtl ? "عضو معتمد" : "VERIFIED MEMBER";
  const bw = ctx.measureText(badge).width + 70;
  const bx = rtl ? 130 : W - 130 - bw;
  roundRect(ctx, bx, 140, bw, 72, 36);
  ctx.fillStyle = GREEN;
  ctx.fill();
  text(ctx, badge, bx + bw / 2, 189, 34, CREAM_2, { weight: 700, align: "center", rtl });

  ctx.fillStyle = COPPER;
  ctx.fillRect(130, 320, W - 260, 3);

  // photo
  const px = rtl ? W - 130 - 360 : 130;
  const avatar = d.avatarUrl ? await loadImage(d.avatarUrl) : null;
  ctx.save();
  roundRect(ctx, px, 390, 360, 440, 36);
  ctx.fillStyle = CREAM_2;
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
  ctx.strokeStyle = BROWN;
  ctx.lineWidth = 6;
  roundRect(ctx, px, 390, 360, 440, 36);
  ctx.stroke();

  const ix = rtl ? px - 70 : px + 430;
  const label = (l: string, v: string, y: number, mono = false) => {
    text(ctx, l, ix, y, 30, MUTED, { align: alignS, rtl });
    text(ctx, v, ix, y + 58, 46, mono ? BROWN : GREEN, { weight: 700, align: alignS, rtl: rtl && !mono, maxWidth: 820 });
  };
  text(ctx, rtl ? "اسم العضو" : "Member name", ix, 420, 30, MUTED, { align: alignS, rtl });
  text(ctx, rtl ? d.nameAr : d.nameEn || d.nameAr, ix, 495, 64, BROWN, { weight: 700, align: alignS, rtl: rtl || !d.nameEn, maxWidth: 840 });
  const second = rtl ? d.nameEn : d.nameAr;
  if (second && second !== (rtl ? d.nameAr : d.nameEn)) {
    text(ctx, second, ix, 550, 34, CLAY, { align: alignS, rtl: !rtl, maxWidth: 840 });
  }
  label(rtl ? "الفرع" : "Branch", d.branch, 620);
  label(rtl ? "رقم العضوية" : "Member ID", d.memberCode, 740, true);

  // QR
  const qr = await loadImage(
    await QRCode.toDataURL(d.verifyUrl, { margin: 1, width: 400, color: { dark: BROWN, light: CREAM_2 } }),
  );
  const qx = rtl ? 130 : W - 130 - 330;
  roundRect(ctx, qx, 440, 330, 330, 24);
  ctx.fillStyle = CREAM_2;
  ctx.fill();
  if (qr) ctx.drawImage(qr, qx + 15, 455, 300, 300);
  text(ctx, rtl ? "امسح للتحقق" : "Scan to verify", qx + 165, 820, 30, GREEN, { weight: 700, align: "center", rtl });

  ctx.fillStyle = COPPER;
  ctx.fillRect(130, 1040, W - 260, 2);
  text(ctx, `${rtl ? "تاريخ الإصدار" : "Issued"}: ${d.issued}`, S, 1120, 32, CLAY, { align: alignS, rtl });
  text(ctx, "NCNP LIC. #1200758400 · AL-AHSA, KSA", E, 1120, 30, MUTED, { align: alignE });
  return c;
}

async function drawBack(d: MemberCardData, crest: HTMLImageElement | null) {
  const c = document.createElement("canvas");
  c.width = W;
  c.height = H;
  const ctx = c.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  base(ctx, crest);
  const rtl = d.lang === "ar";
  const S = rtl ? W - 150 : 150;
  const align: CanvasTextAlign = rtl ? "right" : "left";
  ctx.fillStyle = BROWN;
  ctx.fillRect(0, 150, W, 110);
  text(ctx, rtl ? "شروط العضوية" : "Membership terms", W / 2, 225, 52, CREAM_2, { weight: 700, align: "center", rtl });
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
    text(ctx, t, rtl ? S - 50 : S + 50, y, 40, BROWN, { align, rtl, maxWidth: W - 360 });
  });
  ctx.fillStyle = COPPER;
  ctx.fillRect(150, 850, W - 300, 2);
  text(ctx, rtl ? "الأمانة العامة لمجلس أسرة آل بوعبيد" : "General Secretariat, Al Bu Obaid Family Council", W / 2, 950, 44, GREEN, { weight: 700, align: "center", rtl });
  text(ctx, d.verifyUrl.replace(/^https?:\/\//, ""), W / 2, 1030, 32, CLAY, { align: "center" });
  text(ctx, "NCNP License #1200758400 · Saudi Arabia · Al-Ahsa", W / 2, 1110, 30, MUTED, { align: "center" });
  return c;
}

async function render(d: MemberCardData) {
  await document.fonts?.ready;
  const crest = await loadImage("/logo-mark-gold.svg");
  return Promise.all([drawFront(d, crest), drawBack(d, crest)]);
}

async function renderSheet(d: MemberCardData) {
  const [front, back] = await render(d);
  const gap = 120;
  const margin = 100;
  const sheet = document.createElement("canvas");
  sheet.width = W * 2 + gap + margin * 2;
  sheet.height = H + margin * 2;
  const ctx = sheet.getContext("2d");
  if (!ctx) throw new Error("Canvas is unavailable");
  ctx.fillStyle = CREAM_2;
  ctx.fillRect(0, 0, sheet.width, sheet.height);
  ctx.drawImage(front, margin, margin);
  ctx.drawImage(back, margin + W + gap, margin);
  return sheet;
}

function canvasBlob(canvas: HTMLCanvasElement): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => (blob ? resolve(blob) : reject(new Error("Image export failed"))), "image/png");
  });
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
  const sheet = await renderSheet(d);
  const blob = await canvasBlob(sheet);
  const url = URL.createObjectURL(blob);
  save(url, `${d.memberCode}-card.png`);
  setTimeout(() => URL.revokeObjectURL(url), 10_000);
}

export async function exportCardPdf(d: MemberCardData) {
  const [front, back] = await render(d);
  const { jsPDF } = await import("jspdf");
  const pdf = new jsPDF({ orientation: "landscape", unit: "mm", format: "a4" });
  const gap = 8;
  const cardWidth = 85.6;
  const cardHeight = 54;
  const x = (297 - cardWidth * 2 - gap) / 2;
  const y = (210 - cardHeight) / 2;
  pdf.addImage(front.toDataURL("image/png"), "PNG", x, y, cardWidth, cardHeight);
  pdf.addImage(back.toDataURL("image/png"), "PNG", x + cardWidth + gap, y, cardWidth, cardHeight);
  pdf.save(`${d.memberCode}-card.pdf`);
}

export async function printCard(d: MemberCardData) {
  const sheet = await renderSheet(d);
  const blob = await canvasBlob(sheet);
  const url = URL.createObjectURL(blob);
  const frame = document.createElement("iframe");
  frame.setAttribute("title", "Member card print sheet");
  frame.style.position = "fixed";
  frame.style.width = "1px";
  frame.style.height = "1px";
  frame.style.opacity = "0";
  frame.style.pointerEvents = "none";
  frame.srcdoc = `<!doctype html><html><head><title>${d.memberCode}</title><style>@page{size:A4 landscape;margin:0}html,body{width:297mm;height:210mm;margin:0}body{display:flex;align-items:center;justify-content:center}img{display:block;width:277mm;height:auto;max-height:190mm;object-fit:contain}</style></head><body><img src="${url}" alt=""></body></html>`;
  document.body.appendChild(frame);
  frame.onload = () => {
    window.setTimeout(() => {
      frame.contentWindow?.focus();
      frame.contentWindow?.print();
      window.setTimeout(() => {
        frame.remove();
        URL.revokeObjectURL(url);
      }, 1_000);
    }, 150);
  };
}
