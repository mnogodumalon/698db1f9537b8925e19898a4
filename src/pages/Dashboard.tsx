import { useState, useEffect, useMemo } from 'react';
import { toast } from 'sonner';
import { format, parseISO } from 'date-fns';
import { de } from 'date-fns/locale';
import {
  TrendingUp,
  TrendingDown,
  FolderOpen,
  Plus,
  Pencil,
  Trash2,
  FileText,
  ChevronDown,
  ChevronRight,
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';

import type {
  Kostengruppen,
  SteuerberaterUebergaben,
  Belegbuchungen,
} from '@/types/app';
import { APP_IDS } from '@/types/app';
import {
  LivingAppsService,
  extractRecordId,
  createRecordUrl,
} from '@/services/livingAppsService';

import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from '@/components/ui/collapsible';
import { Skeleton } from '@/components/ui/skeleton';
import { Toaster } from '@/components/ui/sonner';

// ============================================
// UTILITY FUNCTIONS
// ============================================

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', {
    style: 'currency',
    currency: 'EUR',
  }).format(value);
}

function formatDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '-';
  try {
    return format(parseISO(dateStr.split('T')[0]), 'dd.MM.yyyy', { locale: de });
  } catch {
    return dateStr;
  }
}

const BELEGART_LABELS: Record<string, string> = {
  ausgangsrechnung: 'Ausgangsrechnung',
  quittung: 'Quittung',
  kassenbeleg: 'Kassenbeleg',
  bankbeleg: 'Bankbeleg',
  gutschrift: 'Gutschrift',
  eingangsrechnung: 'Eingangsrechnung',
  sonstiger_beleg: 'Sonstiger Beleg',
};

const INCOME_TYPES = ['ausgangsrechnung', 'gutschrift'];
const EXPENSE_TYPES = ['eingangsrechnung', 'quittung', 'kassenbeleg', 'bankbeleg'];

// ============================================
// CRUD DIALOGS
// ============================================

interface BelegDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: Belegbuchungen | null;
  kostengruppen: Kostengruppen[];
  onSuccess: () => void;
}

function BelegDialog({
  open,
  onOpenChange,
  record,
  kostengruppen,
  onSuccess,
}: BelegDialogProps) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    belegdatum: '',
    belegnummer: '',
    belegbeschreibung: '',
    betrag: '',
    belegart: '',
    kostengruppe: '',
    notizen: '',
  });

  useEffect(() => {
    if (open) {
      const kostengruppeId = record?.fields.kostengruppe
        ? extractRecordId(record.fields.kostengruppe)
        : '';
      setFormData({
        belegdatum: record?.fields.belegdatum?.split('T')[0] || new Date().toISOString().split('T')[0],
        belegnummer: record?.fields.belegnummer || '',
        belegbeschreibung: record?.fields.belegbeschreibung || '',
        betrag: record?.fields.betrag?.toString() || '',
        belegart: record?.fields.belegart || '',
        kostengruppe: kostengruppeId || '',
        notizen: record?.fields.notizen || '',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData: Partial<Belegbuchungen['fields']> = {
        belegdatum: formData.belegdatum,
        belegnummer: formData.belegnummer,
        belegbeschreibung: formData.belegbeschreibung || undefined,
        betrag: formData.betrag ? parseFloat(formData.betrag) : undefined,
        belegart: (formData.belegart || undefined) as Belegbuchungen['fields']['belegart'],
        kostengruppe: formData.kostengruppe
          ? createRecordUrl(APP_IDS.KOSTENGRUPPEN, formData.kostengruppe)
          : undefined,
        notizen: formData.notizen || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateBelegbuchungenEntry(record!.record_id, apiData);
        toast.success('Beleg aktualisiert');
      } else {
        await LivingAppsService.createBelegbuchungenEntry(apiData);
        toast.success('Beleg erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        `Fehler beim ${isEditing ? 'Speichern' : 'Erstellen'}: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Beleg bearbeiten' : 'Neuen Beleg erfassen'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="belegdatum">Belegdatum *</Label>
              <Input
                id="belegdatum"
                type="date"
                value={formData.belegdatum}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, belegdatum: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="belegnummer">Belegnummer *</Label>
              <Input
                id="belegnummer"
                value={formData.belegnummer}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, belegnummer: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="belegbeschreibung">Beschreibung</Label>
            <Textarea
              id="belegbeschreibung"
              value={formData.belegbeschreibung}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  belegbeschreibung: e.target.value,
                }))
              }
              rows={2}
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="betrag">Betrag (EUR) *</Label>
              <Input
                id="betrag"
                type="number"
                step="0.01"
                value={formData.betrag}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, betrag: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="belegart">Belegart</Label>
              <Select
                value={formData.belegart || 'none'}
                onValueChange={(v) =>
                  setFormData((prev) => ({
                    ...prev,
                    belegart: v === 'none' ? '' : v,
                  }))
                }
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Belegart wählen" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Auswahl</SelectItem>
                  {Object.entries(BELEGART_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>
                      {label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="kostengruppe">Kostengruppe</Label>
            <Select
              value={formData.kostengruppe || 'none'}
              onValueChange={(v) =>
                setFormData((prev) => ({
                  ...prev,
                  kostengruppe: v === 'none' ? '' : v,
                }))
              }
            >
              <SelectTrigger className="w-full">
                <SelectValue placeholder="Kostengruppe wählen" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Keine Auswahl</SelectItem>
                {kostengruppen.map((kg) => (
                  <SelectItem key={kg.record_id} value={kg.record_id}>
                    {kg.fields.kostengruppenname || 'Unbenannt'}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="notizen">Notizen</Label>
            <Textarea
              id="notizen"
              value={formData.notizen}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, notizen: e.target.value }))
              }
              rows={2}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface KostengruppeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: Kostengruppen | null;
  onSuccess: () => void;
}

function KostengruppeDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: KostengruppeDialogProps) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    kostengruppenname: '',
    kostengruppennummer: '',
    beschreibung: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        kostengruppenname: record?.fields.kostengruppenname || '',
        kostengruppennummer: record?.fields.kostengruppennummer || '',
        beschreibung: record?.fields.beschreibung || '',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData = {
        kostengruppenname: formData.kostengruppenname,
        kostengruppennummer: formData.kostengruppennummer || undefined,
        beschreibung: formData.beschreibung || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateKostengruppenEntry(record!.record_id, apiData);
        toast.success('Kostengruppe aktualisiert');
      } else {
        await LivingAppsService.createKostengruppenEntry(apiData);
        toast.success('Kostengruppe erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Kostengruppe bearbeiten' : 'Neue Kostengruppe'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kostengruppenname">Name *</Label>
            <Input
              id="kostengruppenname"
              value={formData.kostengruppenname}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  kostengruppenname: e.target.value,
                }))
              }
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="kostengruppennummer">Nummer</Label>
            <Input
              id="kostengruppennummer"
              value={formData.kostengruppennummer}
              onChange={(e) =>
                setFormData((prev) => ({
                  ...prev,
                  kostengruppennummer: e.target.value,
                }))
              }
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="beschreibung">Beschreibung</Label>
            <Textarea
              id="beschreibung"
              value={formData.beschreibung}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, beschreibung: e.target.value }))
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface UebergabeDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  record?: SteuerberaterUebergaben | null;
  onSuccess: () => void;
}

function UebergabeDialog({
  open,
  onOpenChange,
  record,
  onSuccess,
}: UebergabeDialogProps) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const today = new Date().toISOString().split('T')[0];
  const firstOfMonth = new Date();
  firstOfMonth.setDate(1);
  const firstOfMonthStr = firstOfMonth.toISOString().split('T')[0];

  const [formData, setFormData] = useState({
    stichtag: '',
    periode_von: '',
    periode_bis: '',
    bemerkungen: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        stichtag: record?.fields.stichtag?.split('T')[0] || today,
        periode_von: record?.fields.periode_von?.split('T')[0] || firstOfMonthStr,
        periode_bis: record?.fields.periode_bis?.split('T')[0] || today,
        bemerkungen: record?.fields.bemerkungen || '',
      });
    }
  }, [open, record, today, firstOfMonthStr]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);

    try {
      const apiData = {
        stichtag: formData.stichtag,
        periode_von: formData.periode_von,
        periode_bis: formData.periode_bis,
        bemerkungen: formData.bemerkungen || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateSteuerberaterUebergabenEntry(
          record!.record_id,
          apiData
        );
        toast.success('Übergabe aktualisiert');
      } else {
        await LivingAppsService.createSteuerberaterUebergabenEntry(apiData);
        toast.success('Übergabe erstellt');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(
        `Fehler: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {isEditing ? 'Übergabe bearbeiten' : 'Neue Übergabe'}
          </DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="stichtag">Stichtag *</Label>
            <Input
              id="stichtag"
              type="date"
              value={formData.stichtag}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, stichtag: e.target.value }))
              }
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="periode_von">Periode von *</Label>
              <Input
                id="periode_von"
                type="date"
                value={formData.periode_von}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, periode_von: e.target.value }))
                }
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="periode_bis">Periode bis *</Label>
              <Input
                id="periode_bis"
                type="date"
                value={formData.periode_bis}
                onChange={(e) =>
                  setFormData((prev) => ({ ...prev, periode_bis: e.target.value }))
                }
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bemerkungen">Bemerkungen</Label>
            <Textarea
              id="bemerkungen"
              value={formData.bemerkungen}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, bemerkungen: e.target.value }))
              }
              rows={3}
            />
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
            >
              Abbrechen
            </Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface DeleteConfirmDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title: string;
  description: string;
  onConfirm: () => Promise<void>;
}

function DeleteConfirmDialog({
  open,
  onOpenChange,
  title,
  description,
  onConfirm,
}: DeleteConfirmDialogProps) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      onOpenChange(false);
    } catch {
      // Error handling done in onConfirm
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>{title}</AlertDialogTitle>
          <AlertDialogDescription>{description}</AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel>Abbrechen</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDelete}
            disabled={deleting}
            className="bg-destructive text-white hover:bg-destructive/90"
          >
            {deleting ? 'Löscht...' : 'Löschen'}
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
}

// ============================================
// LOADING STATE
// ============================================

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header skeleton */}
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-48" />
          <Skeleton className="h-10 w-40" />
        </div>

        {/* Hero skeleton */}
        <Skeleton className="h-40 w-full rounded-xl" />

        {/* Stats skeleton */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg hidden md:block" />
        </div>

        {/* Table skeleton */}
        <Skeleton className="h-96 rounded-lg" />
      </div>
    </div>
  );
}

// ============================================
// EMPTY STATE
// ============================================

function EmptyState({
  title,
  description,
  action,
}: {
  title: string;
  description: string;
  action?: React.ReactNode;
}) {
  return (
    <div className="flex flex-col items-center justify-center py-12 text-center">
      <FileText className="h-12 w-12 text-muted-foreground mb-4" />
      <h3 className="text-lg font-medium mb-2">{title}</h3>
      <p className="text-muted-foreground mb-4 max-w-sm">{description}</p>
      {action}
    </div>
  );
}

// ============================================
// MAIN DASHBOARD COMPONENT
// ============================================

export default function Dashboard() {
  // Data state
  const [belegbuchungen, setBelegbuchungen] = useState<Belegbuchungen[]>([]);
  const [kostengruppen, setKostengruppen] = useState<Kostengruppen[]>([]);
  const [uebergaben, setUebergaben] = useState<SteuerberaterUebergaben[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // UI state
  const [showBelegDialog, setShowBelegDialog] = useState(false);
  const [editBeleg, setEditBeleg] = useState<Belegbuchungen | null>(null);
  const [deleteBeleg, setDeleteBeleg] = useState<Belegbuchungen | null>(null);

  const [showKostengruppeDialog, setShowKostengruppeDialog] = useState(false);
  const [editKostengruppe, setEditKostengruppe] = useState<Kostengruppen | null>(null);
  const [deleteKostengruppe, setDeleteKostengruppe] = useState<Kostengruppen | null>(null);

  const [showUebergabeDialog, setShowUebergabeDialog] = useState(false);
  const [editUebergabe, setEditUebergabe] = useState<SteuerberaterUebergaben | null>(null);
  const [deleteUebergabe, setDeleteUebergabe] = useState<SteuerberaterUebergaben | null>(null);

  // Collapsible state for mobile
  const [kostengruppenOpen, setKostengruppenOpen] = useState(false);
  const [uebergabenOpen, setUebergabenOpen] = useState(false);

  // Fetch data
  async function fetchData() {
    try {
      setLoading(true);
      setError(null);
      const [bel, kg, ueb] = await Promise.all([
        LivingAppsService.getBelegbuchungen(),
        LivingAppsService.getKostengruppen(),
        LivingAppsService.getSteuerberaterUebergaben(),
      ]);
      setBelegbuchungen(bel);
      setKostengruppen(kg);
      setUebergaben(ueb);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Fehler beim Laden'));
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    fetchData();
  }, []);

  // Computed values
  const totalBetrag = useMemo(() => {
    return belegbuchungen.reduce((sum, b) => sum + (b.fields.betrag || 0), 0);
  }, [belegbuchungen]);

  const einnahmen = useMemo(() => {
    return belegbuchungen
      .filter((b) => INCOME_TYPES.includes(b.fields.belegart || ''))
      .reduce((sum, b) => sum + (b.fields.betrag || 0), 0);
  }, [belegbuchungen]);

  const ausgaben = useMemo(() => {
    return belegbuchungen
      .filter((b) => EXPENSE_TYPES.includes(b.fields.belegart || ''))
      .reduce((sum, b) => sum + (b.fields.betrag || 0), 0);
  }, [belegbuchungen]);

  const sortedBelegbuchungen = useMemo(() => {
    return [...belegbuchungen].sort((a, b) => {
      const dateA = a.fields.belegdatum || a.createdat;
      const dateB = b.fields.belegdatum || b.createdat;
      return dateB.localeCompare(dateA);
    });
  }, [belegbuchungen]);

  const chartData = useMemo(() => {
    const grouped: Record<string, number> = {};
    belegbuchungen.forEach((b) => {
      const date = (b.fields.belegdatum || b.createdat).split('T')[0];
      grouped[date] = (grouped[date] || 0) + (b.fields.betrag || 0);
    });

    return Object.entries(grouped)
      .sort(([a], [b]) => a.localeCompare(b))
      .slice(-30)
      .map(([date, value]) => ({
        date: format(parseISO(date), 'dd.MM', { locale: de }),
        value,
      }));
  }, [belegbuchungen]);

  const kostengruppenMap = useMemo(() => {
    const map = new Map<string, Kostengruppen>();
    kostengruppen.forEach((kg) => map.set(kg.record_id, kg));
    return map;
  }, [kostengruppen]);

  const bookingsPerKostengruppe = useMemo(() => {
    const counts: Record<string, number> = {};
    belegbuchungen.forEach((b) => {
      const kgId = extractRecordId(b.fields.kostengruppe);
      if (kgId) {
        counts[kgId] = (counts[kgId] || 0) + 1;
      }
    });
    return counts;
  }, [belegbuchungen]);

  // Delete handlers
  async function handleDeleteBeleg() {
    if (!deleteBeleg) return;
    try {
      await LivingAppsService.deleteBelegbuchungenEntry(deleteBeleg.record_id);
      toast.success('Beleg gelöscht');
      setDeleteBeleg(null);
      fetchData();
    } catch (err) {
      toast.error(
        `Fehler beim Löschen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
      );
    }
  }

  async function handleDeleteKostengruppe() {
    if (!deleteKostengruppe) return;
    try {
      await LivingAppsService.deleteKostengruppenEntry(deleteKostengruppe.record_id);
      toast.success('Kostengruppe gelöscht');
      setDeleteKostengruppe(null);
      fetchData();
    } catch (err) {
      toast.error(
        `Fehler beim Löschen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
      );
    }
  }

  async function handleDeleteUebergabe() {
    if (!deleteUebergabe) return;
    try {
      await LivingAppsService.deleteSteuerberaterUebergabenEntry(deleteUebergabe.record_id);
      toast.success('Übergabe gelöscht');
      setDeleteUebergabe(null);
      fetchData();
    } catch (err) {
      toast.error(
        `Fehler beim Löschen: ${err instanceof Error ? err.message : 'Unbekannter Fehler'}`
      );
    }
  }

  // Render states
  if (loading) return <LoadingState />;

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <Card className="max-w-md w-full">
          <CardContent className="pt-6 text-center">
            <h2 className="text-lg font-semibold mb-2">Fehler beim Laden</h2>
            <p className="text-muted-foreground mb-4">{error.message}</p>
            <Button onClick={() => fetchData()}>Erneut versuchen</Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <>
      <Toaster position="top-right" />

      {/* Desktop Layout */}
      <div className="min-h-screen bg-background">
        {/* Header */}
        <header className="border-b bg-card sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 md:px-6 py-4 flex items-center justify-between">
            <h1 className="text-xl md:text-2xl font-semibold text-foreground">
              Buchhaltungs-Manager
            </h1>
            <Button
              onClick={() => {
                setEditBeleg(null);
                setShowBelegDialog(true);
              }}
              className="hidden md:flex"
            >
              <Plus className="h-4 w-4 mr-2" />
              Neuen Beleg erfassen
            </Button>
          </div>
        </header>

        <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Hero KPI Card */}
              <Card className="relative overflow-hidden border-l-[3px] border-l-primary shadow-sm">
                <div className="absolute inset-0 bg-gradient-to-r from-[hsl(40_20%_97%)] to-[hsl(40_15%_99%)]" />
                <CardContent className="relative py-8 px-6">
                  <p className="text-xs uppercase tracking-wider text-muted-foreground mb-2">
                    Gesamtbetrag
                  </p>
                  <p className="text-4xl md:text-5xl font-light text-foreground mb-2">
                    {formatCurrency(totalBetrag)}
                  </p>
                  <p className="text-sm text-muted-foreground">
                    aus {belegbuchungen.length} Buchungen
                  </p>
                </CardContent>
              </Card>

              {/* Quick Stats Row */}
              <div className="flex gap-4 overflow-x-auto pb-2 -mx-4 px-4 md:mx-0 md:px-0 md:grid md:grid-cols-3">
                <Card className="min-w-[140px] flex-shrink-0 md:min-w-0">
                  <CardContent className="py-4 px-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[hsl(160_60%_95%)]">
                      <TrendingUp className="h-4 w-4 text-[hsl(160_60%_40%)]" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Einnahmen</p>
                      <p className="text-lg font-semibold text-[hsl(160_60%_40%)]">
                        {formatCurrency(einnahmen)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-[140px] flex-shrink-0 md:min-w-0">
                  <CardContent className="py-4 px-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-[hsl(0_65%_95%)]">
                      <TrendingDown className="h-4 w-4 text-destructive" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Ausgaben</p>
                      <p className="text-lg font-semibold text-destructive">
                        {formatCurrency(ausgaben)}
                      </p>
                    </div>
                  </CardContent>
                </Card>

                <Card className="min-w-[140px] flex-shrink-0 md:min-w-0">
                  <CardContent className="py-4 px-4 flex items-center gap-3">
                    <div className="p-2 rounded-full bg-muted">
                      <FolderOpen className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div>
                      <p className="text-xs text-muted-foreground">Kostengruppen</p>
                      <p className="text-lg font-semibold">{kostengruppen.length}</p>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Chart */}
              {chartData.length > 0 && (
                <Card>
                  <CardHeader className="pb-4">
                    <CardTitle className="text-base font-medium">
                      Buchungsverlauf (letzte 30 Tage)
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="h-[200px] md:h-[250px]">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={chartData}>
                          <defs>
                            <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                              <stop
                                offset="5%"
                                stopColor="hsl(175 60% 35%)"
                                stopOpacity={0.3}
                              />
                              <stop
                                offset="95%"
                                stopColor="hsl(175 60% 35%)"
                                stopOpacity={0}
                              />
                            </linearGradient>
                          </defs>
                          <XAxis
                            dataKey="date"
                            tick={{ fontSize: 11 }}
                            stroke="hsl(220 10% 50%)"
                            tickLine={false}
                            axisLine={false}
                          />
                          <YAxis
                            tick={{ fontSize: 11 }}
                            stroke="hsl(220 10% 50%)"
                            tickLine={false}
                            axisLine={false}
                            tickFormatter={(v) => `${v}€`}
                            className="hidden md:block"
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: 'hsl(0 0% 100%)',
                              border: '1px solid hsl(220 15% 90%)',
                              borderRadius: '8px',
                            }}
                            formatter={(value: number) => [formatCurrency(value), 'Betrag']}
                          />
                          <Area
                            type="monotone"
                            dataKey="value"
                            stroke="hsl(175 60% 35%)"
                            strokeWidth={2}
                            fill="url(#colorValue)"
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Buchungen Table (Desktop) */}
              <Card className="hidden md:block">
                <CardHeader className="pb-4">
                  <CardTitle className="text-base font-medium">
                    Alle Buchungen
                  </CardTitle>
                </CardHeader>
                <CardContent className="px-0">
                  {sortedBelegbuchungen.length === 0 ? (
                    <EmptyState
                      title="Keine Buchungen"
                      description="Erfassen Sie Ihren ersten Beleg, um loszulegen."
                      action={
                        <Button
                          onClick={() => {
                            setEditBeleg(null);
                            setShowBelegDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Ersten Beleg erfassen
                        </Button>
                      }
                    />
                  ) : (
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Datum</TableHead>
                          <TableHead>Belegnr.</TableHead>
                          <TableHead className="max-w-[200px]">Beschreibung</TableHead>
                          <TableHead>Belegart</TableHead>
                          <TableHead>Kostengruppe</TableHead>
                          <TableHead className="text-right">Betrag</TableHead>
                          <TableHead className="w-[80px]"></TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {sortedBelegbuchungen.map((beleg) => {
                          const kgId = extractRecordId(beleg.fields.kostengruppe);
                          const kg = kgId ? kostengruppenMap.get(kgId) : null;
                          return (
                            <TableRow key={beleg.record_id} className="group">
                              <TableCell>{formatDate(beleg.fields.belegdatum)}</TableCell>
                              <TableCell className="font-medium">
                                {beleg.fields.belegnummer || '-'}
                              </TableCell>
                              <TableCell className="max-w-[200px] truncate">
                                {beleg.fields.belegbeschreibung || '-'}
                              </TableCell>
                              <TableCell>
                                {beleg.fields.belegart && (
                                  <Badge variant="secondary" className="text-xs">
                                    {BELEGART_LABELS[beleg.fields.belegart] ||
                                      beleg.fields.belegart}
                                  </Badge>
                                )}
                              </TableCell>
                              <TableCell>
                                {kg?.fields.kostengruppenname || '-'}
                              </TableCell>
                              <TableCell className="text-right font-medium">
                                {formatCurrency(beleg.fields.betrag)}
                              </TableCell>
                              <TableCell>
                                <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8"
                                    onClick={() => {
                                      setEditBeleg(beleg);
                                      setShowBelegDialog(true);
                                    }}
                                  >
                                    <Pencil className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 text-destructive hover:text-destructive"
                                    onClick={() => setDeleteBeleg(beleg)}
                                  >
                                    <Trash2 className="h-4 w-4" />
                                  </Button>
                                </div>
                              </TableCell>
                            </TableRow>
                          );
                        })}
                      </TableBody>
                    </Table>
                  )}
                </CardContent>
              </Card>

              {/* Buchungen List (Mobile) */}
              <div className="md:hidden space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-base font-medium">Letzte Buchungen</h2>
                </div>
                {sortedBelegbuchungen.length === 0 ? (
                  <EmptyState
                    title="Keine Buchungen"
                    description="Tippen Sie auf + um Ihren ersten Beleg zu erfassen."
                  />
                ) : (
                  <div className="space-y-3">
                    {sortedBelegbuchungen.slice(0, 5).map((beleg) => (
                      <Card
                        key={beleg.record_id}
                        className="cursor-pointer hover:shadow-md transition-shadow"
                        onClick={() => {
                          setEditBeleg(beleg);
                          setShowBelegDialog(true);
                        }}
                      >
                        <CardContent className="py-3 px-4">
                          <div className="flex items-start justify-between gap-2">
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-1">
                                <span className="font-medium text-sm">
                                  {beleg.fields.belegnummer || '-'}
                                </span>
                                {beleg.fields.belegart && (
                                  <Badge variant="secondary" className="text-xs">
                                    {BELEGART_LABELS[beleg.fields.belegart] ||
                                      beleg.fields.belegart}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(beleg.fields.belegdatum)}
                              </p>
                            </div>
                            <p className="font-semibold text-right">
                              {formatCurrency(beleg.fields.betrag)}
                            </p>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </div>

              {/* Kostengruppen Section (Mobile - Collapsible) */}
              <div className="md:hidden">
                <Collapsible open={kostengruppenOpen} onOpenChange={setKostengruppenOpen}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium">
                            Kostengruppen
                          </CardTitle>
                          {kostengruppenOpen ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mb-4"
                          onClick={() => {
                            setEditKostengruppe(null);
                            setShowKostengruppeDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Neue Kostengruppe
                        </Button>
                        {kostengruppen.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Keine Kostengruppen vorhanden
                          </p>
                        ) : (
                          <div className="grid grid-cols-2 gap-2">
                            {kostengruppen.map((kg) => (
                              <div
                                key={kg.record_id}
                                className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setEditKostengruppe(kg);
                                  setShowKostengruppeDialog(true);
                                }}
                              >
                                <p className="font-medium text-sm truncate">
                                  {kg.fields.kostengruppenname || 'Unbenannt'}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {bookingsPerKostengruppe[kg.record_id] || 0} Buchungen
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>

              {/* Übergaben Section (Mobile - Collapsible) */}
              <div className="md:hidden">
                <Collapsible open={uebergabenOpen} onOpenChange={setUebergabenOpen}>
                  <Card>
                    <CollapsibleTrigger asChild>
                      <CardHeader className="cursor-pointer hover:bg-muted/50 transition-colors">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-base font-medium">
                            Steuerberater-Übergaben
                          </CardTitle>
                          {uebergabenOpen ? (
                            <ChevronDown className="h-5 w-5 text-muted-foreground" />
                          ) : (
                            <ChevronRight className="h-5 w-5 text-muted-foreground" />
                          )}
                        </div>
                      </CardHeader>
                    </CollapsibleTrigger>
                    <CollapsibleContent>
                      <CardContent className="pt-0">
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mb-4"
                          onClick={() => {
                            setEditUebergabe(null);
                            setShowUebergabeDialog(true);
                          }}
                        >
                          <Plus className="h-4 w-4 mr-2" />
                          Neue Übergabe
                        </Button>
                        {uebergaben.length === 0 ? (
                          <p className="text-sm text-muted-foreground text-center py-4">
                            Keine Übergaben vorhanden
                          </p>
                        ) : (
                          <div className="space-y-2">
                            {uebergaben.map((ueb) => (
                              <div
                                key={ueb.record_id}
                                className="p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
                                onClick={() => {
                                  setEditUebergabe(ueb);
                                  setShowUebergabeDialog(true);
                                }}
                              >
                                <p className="font-medium text-sm">
                                  Stichtag: {formatDate(ueb.fields.stichtag)}
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  {formatDate(ueb.fields.periode_von)} -{' '}
                                  {formatDate(ueb.fields.periode_bis)}
                                </p>
                              </div>
                            ))}
                          </div>
                        )}
                      </CardContent>
                    </CollapsibleContent>
                  </Card>
                </Collapsible>
              </div>
            </div>

            {/* Right Column (Desktop only) */}
            <div className="hidden lg:block space-y-6">
              {/* Kostengruppen */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      Kostengruppen
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditKostengruppe(null);
                        setShowKostengruppeDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Neu
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {kostengruppen.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Keine Kostengruppen vorhanden
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {kostengruppen.map((kg) => (
                        <div
                          key={kg.record_id}
                          className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                          onClick={() => {
                            setEditKostengruppe(kg);
                            setShowKostengruppeDialog(true);
                          }}
                        >
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-sm truncate">
                              {kg.fields.kostengruppenname || 'Unbenannt'}
                            </p>
                            {kg.fields.kostengruppennummer && (
                              <p className="text-xs text-muted-foreground">
                                Nr. {kg.fields.kostengruppennummer}
                              </p>
                            )}
                          </div>
                          <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="text-xs">
                              {bookingsPerKostengruppe[kg.record_id] || 0}
                            </Badge>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteKostengruppe(kg);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Steuerberater-Übergaben */}
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-base font-medium">
                      Steuerberater-Übergaben
                    </CardTitle>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => {
                        setEditUebergabe(null);
                        setShowUebergabeDialog(true);
                      }}
                    >
                      <Plus className="h-4 w-4 mr-1" />
                      Neu
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="pt-0">
                  {uebergaben.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Keine Übergaben vorhanden
                    </p>
                  ) : (
                    <div className="space-y-2">
                      {[...uebergaben]
                        .sort((a, b) =>
                          (b.fields.stichtag || '').localeCompare(
                            a.fields.stichtag || ''
                          )
                        )
                        .map((ueb) => (
                          <div
                            key={ueb.record_id}
                            className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors group"
                            onClick={() => {
                              setEditUebergabe(ueb);
                              setShowUebergabeDialog(true);
                            }}
                          >
                            <div>
                              <p className="font-medium text-sm">
                                {formatDate(ueb.fields.stichtag)}
                              </p>
                              <p className="text-xs text-muted-foreground">
                                {formatDate(ueb.fields.periode_von)} –{' '}
                                {formatDate(ueb.fields.periode_bis)}
                              </p>
                            </div>
                            <Button
                              variant="ghost"
                              size="icon"
                              className="h-7 w-7 opacity-0 group-hover:opacity-100 text-destructive hover:text-destructive"
                              onClick={(e) => {
                                e.stopPropagation();
                                setDeleteUebergabe(ueb);
                              }}
                            >
                              <Trash2 className="h-3.5 w-3.5" />
                            </Button>
                          </div>
                        ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>

        {/* Mobile FAB */}
        <Button
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg md:hidden"
          size="icon"
          onClick={() => {
            setEditBeleg(null);
            setShowBelegDialog(true);
          }}
        >
          <Plus className="h-6 w-6" />
        </Button>
      </div>

      {/* Dialogs */}
      <BelegDialog
        open={showBelegDialog}
        onOpenChange={setShowBelegDialog}
        record={editBeleg}
        kostengruppen={kostengruppen}
        onSuccess={fetchData}
      />

      <KostengruppeDialog
        open={showKostengruppeDialog}
        onOpenChange={setShowKostengruppeDialog}
        record={editKostengruppe}
        onSuccess={fetchData}
      />

      <UebergabeDialog
        open={showUebergabeDialog}
        onOpenChange={setShowUebergabeDialog}
        record={editUebergabe}
        onSuccess={fetchData}
      />

      <DeleteConfirmDialog
        open={!!deleteBeleg}
        onOpenChange={(open) => !open && setDeleteBeleg(null)}
        title="Beleg löschen?"
        description={`Möchtest du den Beleg "${deleteBeleg?.fields.belegnummer || ''}" wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.`}
        onConfirm={handleDeleteBeleg}
      />

      <DeleteConfirmDialog
        open={!!deleteKostengruppe}
        onOpenChange={(open) => !open && setDeleteKostengruppe(null)}
        title="Kostengruppe löschen?"
        description={`Möchtest du die Kostengruppe "${deleteKostengruppe?.fields.kostengruppenname || ''}" wirklich löschen? Verknüpfte Buchungen verlieren ihre Zuordnung.`}
        onConfirm={handleDeleteKostengruppe}
      />

      <DeleteConfirmDialog
        open={!!deleteUebergabe}
        onOpenChange={(open) => !open && setDeleteUebergabe(null)}
        title="Übergabe löschen?"
        description={`Möchtest du diese Übergabe vom ${formatDate(deleteUebergabe?.fields.stichtag)} wirklich löschen?`}
        onConfirm={handleDeleteUebergabe}
      />
    </>
  );
}
