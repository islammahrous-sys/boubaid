import { createContext, useCallback, useContext, useRef, useState, type ReactNode } from "react";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useLang } from "@/i18n/LanguageProvider";

export type ConfirmOptions = {
  title: string;
  description?: string;
  /** Defaults to "حذف" / "Delete" when tone is "destructive", otherwise "تأكيد" / "Confirm". */
  confirmLabel?: string;
  cancelLabel?: string;
  /** "destructive" styles the confirm button red -- use for delete/remove/revoke actions. */
  tone?: "default" | "destructive";
};

type ConfirmFn = (options: ConfirmOptions) => Promise<boolean>;

const ConfirmContext = createContext<ConfirmFn | null>(null);

/**
 * Promise-based replacement for the browser's native confirm(): styled
 * consistently with the rest of the app (bilingual, RTL-aware, themed)
 * instead of an unstyled blocking browser dialog. Mount once near the root
 * of a section (e.g. the admin console) and call useConfirm() anywhere
 * beneath it -- usage is a near drop-in replacement for
 * `if (confirm("...")) { ... }`:
 *
 *   const confirm = useConfirm();
 *   if (await confirm({ title: "...", tone: "destructive" })) { ... }
 */
export function ConfirmProvider({ children }: { children: ReactNode }) {
  const { lang } = useLang();
  const isAr = lang === "ar";
  const [options, setOptions] = useState<ConfirmOptions | null>(null);
  const resolveRef = useRef<((value: boolean) => void) | null>(null);

  const confirm = useCallback<ConfirmFn>((opts) => {
    return new Promise<boolean>((resolve) => {
      resolveRef.current = resolve;
      setOptions(opts);
    });
  }, []);

  const settle = (value: boolean) => {
    resolveRef.current?.(value);
    resolveRef.current = null;
    setOptions(null);
  };

  const defaultConfirmLabel =
    options?.tone === "destructive" ? (isAr ? "حذف" : "Delete") : isAr ? "تأكيد" : "Confirm";

  return (
    <ConfirmContext.Provider value={confirm}>
      {children}
      <AlertDialog open={options !== null} onOpenChange={(open) => !open && settle(false)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{options?.title}</AlertDialogTitle>
            {options?.description && (
              <AlertDialogDescription>{options.description}</AlertDialogDescription>
            )}
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => settle(false)}>
              {options?.cancelLabel || (isAr ? "إلغاء" : "Cancel")}
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={() => settle(true)}
              className={
                options?.tone === "destructive"
                  ? "bg-destructive text-destructive-foreground hover:bg-destructive/90"
                  : undefined
              }
            >
              {options?.confirmLabel || defaultConfirmLabel}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </ConfirmContext.Provider>
  );
}

export function useConfirm(): ConfirmFn {
  const ctx = useContext(ConfirmContext);
  if (!ctx) {
    throw new Error("useConfirm() must be used within a <ConfirmProvider>");
  }
  return ctx;
}
