import { useState } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useLang } from "@/i18n/LanguageProvider";
import { Plus, Edit2, MapPin } from "lucide-react";
import type { PlaceInput } from "@/lib/admin-hub.schemas";

export type PlaceRow = {
  id: string;
  name_ar: string;
  name_en?: string | null;
  country: string;
  region?: string | null;
  city?: string | null;
  address?: string | null;
  latitude?: number | null;
  longitude?: number | null;
  description_ar?: string | null;
};

export function PlacesManager({
  places,
  onSavePlace,
}: {
  places: PlaceRow[];
  onSavePlace: (data: PlaceInput) => Promise<void>;
}) {
  const { lang } = useLang();
  const isAr = lang === "ar";

  const [formOpen, setFormOpen] = useState(false);
  const [selectedPlace, setSelectedPlace] = useState<PlaceRow | null>(null);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<PlaceInput>({
    id: undefined,
    name_ar: "",
    name_en: "",
    country: "SA",
    region: "",
    city: "",
    address: "",
    latitude: null,
    longitude: null,
    description_ar: "",
  });

  const handleOpenAdd = () => {
    setSelectedPlace(null);
    setForm({
      id: undefined,
      name_ar: "",
      name_en: "",
      country: "SA",
      region: "",
      city: "",
      address: "",
      latitude: null,
      longitude: null,
      description_ar: "",
    });
    setFormOpen(true);
  };

  const handleOpenEdit = (p: PlaceRow) => {
    setSelectedPlace(p);
    setForm({
      id: p.id,
      name_ar: p.name_ar,
      name_en: p.name_en ?? "",
      country: p.country,
      region: p.region ?? "",
      city: p.city ?? "",
      address: p.address ?? "",
      latitude: p.latitude ?? null,
      longitude: p.longitude ?? null,
      description_ar: p.description_ar ?? "",
    });
    setFormOpen(true);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.name_ar.trim()) return;
    try {
      setLoading(true);
      await onSavePlace(form);
      setFormOpen(false);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-card p-4 rounded-xl border border-border">
        <div className="flex items-center gap-2.5">
          <MapPin className="w-5 h-5 text-primary" />
          <h3 className="text-sm font-bold text-foreground">
            {isAr ? "دليل المواقع والمقار الجغرافية" : "Geographic Places & Locations"}
          </h3>
        </div>
        <Button size="sm" onClick={handleOpenAdd} className="h-8 text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" />
          {isAr ? "إضافة موقع جديد" : "Add Place"}
        </Button>
      </div>

      <div className="border border-border rounded-xl bg-card overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="bg-muted/40 text-xs">
              <TableHead>{isAr ? "اسم المكان" : "Place Name"}</TableHead>
              <TableHead>{isAr ? "المدينة / المنطقة" : "City / Region"}</TableHead>
              <TableHead>{isAr ? "العنوان" : "Address"}</TableHead>
              <TableHead className="text-end">{isAr ? "إجراء" : "Action"}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {places.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="h-28 text-center text-muted-foreground text-xs">
                  {isAr ? "لا توجد مواقع مسجلة" : "No places registered"}
                </TableCell>
              </TableRow>
            ) : (
              places.map((p) => (
                <TableRow key={p.id} className="text-xs hover:bg-muted/30">
                  <TableCell className="font-semibold text-foreground">{p.name_ar}</TableCell>
                  <TableCell>
                    {p.city ? `${p.city} - ${p.region || ""}` : p.region || "—"}
                  </TableCell>
                  <TableCell className="text-muted-foreground">{p.address || "—"}</TableCell>
                  <TableCell className="text-end">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="w-7 h-7 text-muted-foreground hover:text-foreground"
                      onClick={() => handleOpenEdit(p)}
                    >
                      <Edit2 className="w-3.5 h-3.5" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle className="text-base font-bold">
              {selectedPlace
                ? isAr
                  ? "تعديل موقع"
                  : "Edit Place"
                : isAr
                  ? "إضافة موقع جديد"
                  : "Add Place"}
            </DialogTitle>
          </DialogHeader>
          <form onSubmit={handleSubmit} className="space-y-3.5 text-xs">
            <div className="space-y-1">
              <Label className="text-xs">
                {isAr ? "اسم المكان بالعربية *" : "Place Name (AR) *"}
              </Label>
              <Input
                required
                value={form.name_ar}
                onChange={(e) => setForm({ ...form, name_ar: e.target.value })}
                placeholder="مثال: ديوانية الصالحية — الأحساء"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المدينة" : "City"}</Label>
                <Input
                  value={form.city ?? ""}
                  onChange={(e) => setForm({ ...form, city: e.target.value })}
                  placeholder="الهفوف"
                />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">{isAr ? "المنطقة" : "Region"}</Label>
                <Input
                  value={form.region ?? ""}
                  onChange={(e) => setForm({ ...form, region: e.target.value })}
                  placeholder="المنطقة الشرقية"
                />
              </div>
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "العنوان بالتفصيل" : "Address"}</Label>
              <Input
                value={form.address ?? ""}
                onChange={(e) => setForm({ ...form, address: e.target.value })}
                placeholder="شارع الملك فهد..."
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs">{isAr ? "الوصف" : "Description"}</Label>
              <Textarea
                rows={3}
                value={form.description_ar ?? ""}
                onChange={(e) => setForm({ ...form, description_ar: e.target.value })}
              />
            </div>
            <DialogFooter>
              <Button type="button" variant="outline" size="sm" onClick={() => setFormOpen(false)}>
                {isAr ? "إلغاء" : "Cancel"}
              </Button>
              <Button type="submit" size="sm" disabled={loading}>
                {loading ? (isAr ? "جاري الحفظ..." : "Saving...") : isAr ? "حفظ" : "Save"}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
    </div>
  );
}
