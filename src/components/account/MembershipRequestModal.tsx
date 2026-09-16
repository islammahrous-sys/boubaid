import { useState, useEffect } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useLang } from "@/i18n/LanguageProvider";
import {
  Send,
  ShieldCheck,
  MessageSquare,
  User,
  GitBranch,
  Phone,
  Info,
  Loader2,
} from "lucide-react";

export interface MembershipRequestModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  initialData: {
    full_name_ar: string;
    full_name_en?: string;
    branch_slug: string;
    phone?: string;
    father_lineage?: string;
  };
  branches: { id: string; name: { ar: string; en: string } }[];
  onSubmit: (data: {
    full_name_ar: string;
    full_name_en: string;
    branch_slug: string;
    phone: string;
    father_lineage: string;
    notes: string;
  }) => Promise<void>;
  isSubmitting: boolean;
}

export function MembershipRequestModal({
  open,
  onOpenChange,
  initialData,
  branches,
  onSubmit,
  isSubmitting,
}: MembershipRequestModalProps) {
  const { lang, t } = useLang();
  const isAr = lang === "ar";

  const [form, setForm] = useState({
    full_name_ar: "",
    full_name_en: "",
    branch_slug: "",
    phone: "",
    father_lineage: "",
    notes: "",
  });

  // Reset form with initial data when dialog opens
  useEffect(() => {
    if (open) {
      setForm({
        full_name_ar: initialData.full_name_ar || "",
        full_name_en: initialData.full_name_en || "",
        branch_slug: initialData.branch_slug || "",
        phone: initialData.phone || "",
        father_lineage: initialData.father_lineage || "",
        notes: "",
      });
    }
  }, [open, initialData]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.full_name_ar.trim()) return;
    await onSubmit({
      full_name_ar: form.full_name_ar.trim(),
      full_name_en: form.full_name_en.trim(),
      branch_slug: form.branch_slug,
      phone: form.phone.trim(),
      father_lineage: form.father_lineage.trim(),
      notes: form.notes.trim(),
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-2">
          <div className="flex items-center gap-2 text-primary">
            <div className="w-8 h-8 rounded-xl bg-primary/10 flex items-center justify-center">
              <ShieldCheck className="w-4 h-4 text-primary" />
            </div>
            <DialogTitle className="text-base font-bold">
              {isAr ? "تقديم طلب توثيق واعتماد العضوية" : "Submit Membership Verification Request"}
            </DialogTitle>
          </div>
          <DialogDescription className="text-xs text-muted-foreground leading-relaxed">
            {isAr
              ? "يُرفع هذا الطلب إلى أمانة مجلس الأسرة ولجنة الأنساب لمراجعة بياناتك ونسبك، وإصدار بطاقتك الرقمية الرسمية وتوثيق قيدك في سجل الأسرة."
              : "This request will be reviewed by the Family Council Secretariat and Genealogy Committee to officially verify your record and issue your Digital ID."}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4 py-2 text-xs">
          {/* Section 1: Verification Details */}
          <div className="p-3.5 rounded-xl border border-border bg-muted/20 space-y-3">
            <div className="flex items-center gap-1.5 font-bold text-foreground">
              <User className="w-3.5 h-3.5 text-primary" />
              <span>{isAr ? "بيانات مقدم الطلب والنسب" : "Applicant & Lineage Details"}</span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">
                  {isAr ? "الاسم الكامل بالعربية *" : "Full Name (Arabic) *"}
                </Label>
                <Input
                  required
                  value={form.full_name_ar}
                  onChange={(e) => setForm({ ...form, full_name_ar: e.target.value })}
                  placeholder={isAr ? "مثال: عبدالله بن محمد آل بوعبيد" : "Arabic Full Name"}
                  className="h-8 text-xs bg-background"
                />
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">
                  {isAr ? "الاسم بالإنجليزية" : "Full Name (English)"}
                </Label>
                <Input
                  value={form.full_name_en}
                  onChange={(e) => setForm({ ...form, full_name_en: e.target.value })}
                  placeholder="e.g. Abdullah M. Al Bu Obaid"
                  className="h-8 text-xs bg-background"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">
                  {isAr ? "فرع العائلة *" : "Family Branch *"}
                </Label>
                <Select
                  value={form.branch_slug}
                  onValueChange={(val) => setForm({ ...form, branch_slug: val })}
                >
                  <SelectTrigger className="h-8 text-xs bg-background">
                    <SelectValue placeholder={isAr ? "اختر فرع العائلة..." : "Select branch..."} />
                  </SelectTrigger>
                  <SelectContent>
                    {branches.map((b) => (
                      <SelectItem key={b.id} value={b.id}>
                        {t(b.name)}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-1">
                <Label className="text-[11px] font-semibold">
                  {isAr ? "رقم الجوال للتواصل" : "Phone Number"}
                </Label>
                <div className="relative">
                  <Input
                    value={form.phone}
                    onChange={(e) => setForm({ ...form, phone: e.target.value })}
                    placeholder="+966 50 000 0000"
                    className="h-8 text-xs font-mono bg-background"
                  />
                  <Phone className="w-3.5 h-3.5 absolute end-2.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
                </div>
              </div>
            </div>

            <div className="space-y-1">
              <div className="flex items-center justify-between">
                <Label className="text-[11px] font-semibold">
                  {isAr ? "سلسلة النسب والأجداد" : "Lineage & Ancestral Notes"}
                </Label>
                <span className="text-[10px] text-muted-foreground">
                  {isAr ? "اختياري" : "Optional"}
                </span>
              </div>
              <Input
                value={form.father_lineage}
                onChange={(e) => setForm({ ...form, father_lineage: e.target.value })}
                placeholder={
                  isAr
                    ? "مثال: فلان بن فلان بن محمد آل بوعبيد (من أهالي المبرز / الصالحية...)"
                    : "e.g. Son of ... from Al Mubarraz"
                }
                className="h-8 text-xs bg-background"
              />
            </div>
          </div>

          {/* Section 2: Optional Request Message to the Council */}
          <div className="p-3.5 rounded-xl border border-primary/20 bg-primary/[0.03] space-y-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1.5 font-bold text-foreground">
                <MessageSquare className="w-3.5 h-3.5 text-primary" />
                <span>
                  {isAr
                    ? "رسالة أو ملاحظات لمجلس الأسرة (اختياري)"
                    : "Message or Notes to the Council (Optional)"}
                </span>
              </div>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-primary/10 text-primary font-medium">
                {isAr ? "اختياري" : "Optional"}
              </span>
            </div>

            <p className="text-[11px] text-muted-foreground leading-relaxed">
              {isAr
                ? "يمكنك كتابة رسالة توضيحية للأمانة العامة أو لجنة الأنساب (مثال: صلة القرابة، اسم المعرّف من أفراد الأسرة، أو أي توضيحات إضافية تود إيصالها للمجلس لتسهيل وسرعة توثيق طلبك)."
                : "You can write an optional note to the Secretariat or Genealogy Committee (e.g. family references, closest kin, or additional context to expedite review)."}
            </p>

            <Textarea
              rows={3}
              value={form.notes}
              onChange={(e) => setForm({ ...form, notes: e.target.value })}
              placeholder={
                isAr
                  ? "اكتب رسالتك أو ملاحظاتك لمجلس الأسرة هنا (مثال: أرجو اعتماد انضمامي لفرع العائلة، ويمكن التواصل مع الوالد أو العم للتأكيد...)"
                  : "Type your message or notes to the council here..."
              }
              className="text-xs bg-background border-border resize-none"
            />
          </div>

          {/* Privacy & Trust Badge */}
          <div className="flex items-center gap-2 p-2.5 rounded-lg bg-muted/40 text-[11px] text-muted-foreground border border-border/50">
            <Info className="w-3.5 h-3.5 text-primary shrink-0" />
            <span>
              {isAr
                ? "تُعامل جميع البيانات والمراسلات بسرية تامة وتُعرض فقط على مسؤولي مجلس الأسرة المعتمدين."
                : "All submitted data and messages are strictly confidential and visible only to authorized council administrators."}
            </span>
          </div>

          <DialogFooter className="pt-2 gap-2 sm:gap-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={isSubmitting}
              onClick={() => onOpenChange(false)}
              className="h-8 text-xs"
            >
              {isAr ? "إلغاء" : "Cancel"}
            </Button>
            <Button
              type="submit"
              size="sm"
              disabled={isSubmitting || !form.full_name_ar.trim()}
              className="h-8 text-xs font-bold gap-1.5 bg-primary hover:bg-primary/90 text-primary-foreground"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  <span>{isAr ? "جاري الإرسال..." : "Submitting..."}</span>
                </>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>{isAr ? "إرسال طلب الاعتماد للأمانة" : "Submit Request to Council"}</span>
                </>
              )}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
