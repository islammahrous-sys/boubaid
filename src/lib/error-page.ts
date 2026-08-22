export function renderErrorPage(): string {
  return `<!doctype html>
<html lang="ar" dir="rtl">
  <head>
    <meta charset="utf-8" />
    <title>تعذر تحميل الصفحة | أسرة آل بوعبيد</title>
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Amiri:wght@700&family=IBM+Plex+Sans+Arabic:wght@400;600&display=swap" rel="stylesheet">
    <style>
      :root {
        --bg: #0c1219;
        --card: #151d28;
        --border: #232f3e;
        --text: #f6f4ee;
        --muted: #a69f92;
        --gold: #d4af37;
        --gold-hover: #e5c358;
      }
      body {
        font-family: 'IBM Plex Sans Arabic', -apple-system, BlinkMacSystemFont, sans-serif;
        background-color: var(--bg);
        color: var(--text);
        display: grid;
        place-items: center;
        min-height: 100vh;
        margin: 0;
        padding: 1.5rem;
        box-sizing: border-box;
      }
      .card {
        max-width: 32rem;
        width: 100%;
        background: var(--card);
        border: 1px solid var(--border);
        border-radius: 0.75rem;
        text-align: center;
        padding: 2.5rem 2rem;
        box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.5), 0 8px 10px -6px rgba(0, 0, 0, 0.5);
      }
      .brand-crest {
        width: 3rem;
        height: 3rem;
        margin: 0 auto 1.25rem;
        border: 1px solid var(--gold);
        border-radius: 50%;
        display: flex;
        align-items: center;
        justify-content: center;
        color: var(--gold);
        font-family: 'Amiri', serif;
        font-size: 1.25rem;
        font-weight: bold;
      }
      h1 {
        font-family: 'Amiri', serif;
        font-size: 1.65rem;
        color: var(--text);
        margin: 0 0 0.75rem;
      }
      p {
        color: var(--muted);
        font-size: 0.95rem;
        line-height: 1.6;
        margin: 0 0 1.5rem;
      }
      .en-sub {
        font-size: 0.85rem;
        color: #7b7569;
        direction: ltr;
        margin-bottom: 2rem;
      }
      .actions {
        display: flex;
        gap: 0.75rem;
        justify-content: center;
        flex-wrap: wrap;
      }
      a, button {
        padding: 0.65rem 1.25rem;
        border-radius: 0.375rem;
        font-family: inherit;
        font-size: 0.9rem;
        font-weight: 600;
        cursor: pointer;
        text-decoration: none;
        transition: all 0.15s ease-in-out;
      }
      .primary {
        background: var(--gold);
        color: #0c1219;
        border: 1px solid var(--gold);
      }
      .primary:hover {
        background: var(--gold-hover);
        border-color: var(--gold-hover);
      }
      .secondary {
        background: transparent;
        color: var(--text);
        border: 1px solid var(--border);
      }
      .secondary:hover {
        background: var(--border);
      }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="brand-crest">عب</div>
      <h1>تعذر تحميل الصفحة</h1>
      <p>حدث خطأ غير متوقع أثناء معالجة الطلب. يمكنك إعادة المحاولة أو العودة إلى البوابة الرئيسية.</p>
      <div class="en-sub">An unexpected error occurred. You may try refreshing or return to the homepage.</div>
      <div class="actions">
        <button class="primary" onclick="location.reload()">إعادة المحاولة / Retry</button>
        <a class="secondary" href="/">الرئيسية / Go Home</a>
      </div>
    </div>
  </body>
</html>`;
}
