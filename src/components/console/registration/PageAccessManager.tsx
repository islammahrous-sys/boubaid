import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useServerFn } from "@tanstack/react-start";
import { toast } from "sonner";
import { Crown, Globe, Loader2, Lock, Plus, Save, Trash2, Users } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useLang } from "@/i18n/LanguageProvider";
import { PAGE_ACCESS, normaliseEmails, type AccessLevel } from "@/lib/page-access";
import { getPageAccessSetting, savePageAccessSetting } from "@/lib/page-access.functions";
import { cn } from "@/lib/utils";

const LEVEL_META: Record<AccessLevel, { icon: typeof Globe; ar: string; en: string; tone: string }> = {
  public: { icon: Globe, ar: "عام", en: "Public", tone: "border-emerald-500/40 text-emerald-700 dark:text-emerald-400" },
  members: { icon: Users, ar: "أفراد الأسرة المسجلون", en: "Registered members", tone: "border-amber-500/40 text-amber-700 dark:text-amber-400" },
  leadership: { icon: Crown, ar: "رئيس المجلس ورؤساء اللجان", en: "Council & committee chairs", tone: "border-rose-500/40 text-rose-700 dark:text-rose-400" },
};

/**
 * Council control over who sees what. The page-to-level map is the council's
 * approved Pages Access policy (fixed in code, src/lib/page-access.ts, so a
 * console mistake can never open the archive to the public); the people who
 * count as "council chair and committee chairs" are managed here.
 */
export function PageAccessManager() {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const L = (ar: string, en: string) => (isAr ? ar : en);
  const queryClient = useQueryClient();
  const fetchSetting = useServerFn(getPageAccessSetting);
  const saveSetting = useServerFn(savePageAccessSetting);

  const { data, isLoading } = useQuery({ queryKey: ["page-access-setting"], queryFn: () => fetchSetting() });
  const [emails, setEmails] = useState<string[]>([]);
  const [draft, setDraft] = useState("");
  useEffect(() => {
    if (data) setEmails(data.leadership_emails);
  }, [data]);

  const dirty = JSON.stringify(emails) !== JSON.stringify(data?.leadership_emails ?? []);

  const save = useMutation({
    mutationFn: () => saveSetting({ data: { leadership_emails: emails } }),
    onSuccess: (saved) => {
      setEmails(saved.leadership_emails);
      queryClient.setQueryData(["page-access-setting"], saved);
      toast.success(L("تم حفظ قائمة المخوّلين.", "Authorised list saved."));
    },
    onError: (e) => toast.error((e as Error).message),
  });

  const add = () => {
    const next = normaliseEmails([...emails, ...draft.split(/[\s,;]+/)]);
    if (next.length === emails.length) {
      toast.error(L("أدخل بريداً إلكترونياً صحيحاً.", "Enter a valid email address."));
      return;
    }
    setEmails(next);
    setDraft("");
  };

  return (
    <div className="grid gap-6 xl:grid-cols-[minmax(0,1.3fr)_minmax(0,1fr)]">
      <section className="rounded-2xl border border-border bg-card">
        <header className="border-b border-border p-5">
          <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
            <Lock className="h-4 w-4 text-primary" />
            {L("سياسة الوصول إلى الصفحات", "Page access policy")}
          </h3>
          <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
            {L(
              "معتمدة من المجلس ومطبّقة على الخادم. الصفحات المقيدة لا تُعرض في محركات البحث ولا في خريطة الموقع.",
              "Approved by the council and enforced on the server. Restricted pages are excluded from search engines and the sitemap.",
            )}
          </p>
        </header>
        <ul className="divide-y divide-border">
          {PAGE_ACCESS.map((rule) => {
            const meta = LEVEL_META[rule.level];
            const Icon = meta.icon;
            return (
              <li key={rule.path} className="flex items-center justify-between gap-3 px-5 py-3">
                <span className="min-w-0">
                  <span className="block text-sm font-semibold text-foreground">{rule.label[lang]}</span>
                  <a href={rule.path} target="_blank" rel="noopener" className="font-mono text-[11px] text-muted-foreground hover:text-foreground" dir="ltr">
                    {rule.path}
                  </a>
                </span>
                <Badge variant="outline" className={cn("shrink-0 gap-1", meta.tone)}>
                  <Icon className="h-3 w-3" />
                  {isAr ? meta.ar : meta.en}
                </Badge>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="rounded-2xl border border-border bg-card p-5 xl:self-start">
        <h3 className="flex items-center gap-2 text-sm font-bold text-foreground">
          <Crown className="h-4 w-4 text-primary" />
          {L("رئيس المجلس ورؤساء اللجان", "Council chair & committee chairs")}
        </h3>
        <p className="mt-1 text-xs leading-relaxed text-muted-foreground">
          {L(
            "يُتاح لهم الاطلاع على الهوية البصرية. أضف البريد الإلكتروني لحساب كل منهم (يجب أن يكون الحساب عضواً معتمداً). مسؤولو المنصة مخوّلون تلقائياً.",
            "They can open the Visual Identity page. Add the email of each person's account (it must be an approved member). Platform admins are always authorised.",
          )}
        </p>
        <div className="mt-4 flex gap-2">
          <Input
            dir="ltr"
            type="email"
            value={draft}
            onChange={(e) => setDraft(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                add();
              }
            }}
            placeholder="name@example.com"
          />
          <Button type="button" variant="outline" onClick={add} aria-label={L("إضافة", "Add")}>
            <Plus className="h-4 w-4" />
          </Button>
        </div>
        {isLoading ? (
          <div className="mt-4 h-16 animate-pulse rounded-lg bg-muted" />
        ) : emails.length === 0 ? (
          <p className="mt-4 rounded-lg border border-dashed border-border p-4 text-center text-xs text-muted-foreground">
            {L("لم يُضف أحد بعد — الصفحة متاحة لمسؤولي المنصة فقط.", "No one added yet — only platform admins can open the page.")}
          </p>
        ) : (
          <ul className="mt-4 space-y-2">
            {emails.map((e) => (
              <li key={e} className="flex items-center justify-between gap-2 rounded-lg border border-border px-3 py-2">
                <span className="truncate font-mono text-xs" dir="ltr">{e}</span>
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="h-7 w-7"
                  onClick={() => setEmails(emails.filter((x) => x !== e))}
                  aria-label={L(`إزالة ${e}`, `Remove ${e}`)}
                >
                  <Trash2 className="h-3.5 w-3.5 text-destructive" />
                </Button>
              </li>
            ))}
          </ul>
        )}
        <Button className="mt-4 w-full" disabled={!dirty || save.isPending} onClick={() => save.mutate()}>
          {save.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
          {L("حفظ القائمة", "Save list")}
        </Button>
      </section>
    </div>
  );
}
