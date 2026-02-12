import { useState, useEffect, useMemo, useCallback } from 'react';
import type { Kostengruppen, Belegbuchungen, SteuerberaterUebergaben } from '@/types/app';
import { LivingAppsService, extractRecordId, createRecordUrl } from '@/services/livingAppsService';
import { APP_IDS } from '@/types/app';
import { format, parseISO, startOfWeek, endOfWeek, isWithinInterval } from 'date-fns';
import { de } from 'date-fns/locale';
import { toast } from 'sonner';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import {
  Plus, Pencil, Trash2, TrendingUp, TrendingDown, FileText,
  Receipt, AlertCircle, RefreshCw,
} from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';

// ─── Helpers ────────────────────────────────────────────────────────────────

function formatCurrency(value: number | null | undefined): string {
  if (value == null) return '-';
  return new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR' }).format(value);
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
  sonstiger_beleg: 'Sonstiger Beleg',
  eingangsrechnung: 'Eingangsrechnung',
};

const INCOME_TYPES = ['ausgangsrechnung', 'gutschrift'];
const EXPENSE_TYPES = ['eingangsrechnung', 'quittung', 'kassenbeleg', 'bankbeleg', 'sonstiger_beleg'];

const CATEGORY_COLORS = [
  'hsl(185 62% 34%)',
  'hsl(152 55% 40%)',
  'hsl(210 25% 55%)',
  'hsl(35 85% 55%)',
  'hsl(280 45% 55%)',
  'hsl(340 65% 50%)',
  'hsl(60 70% 45%)',
  'hsl(20 80% 50%)',
];

function todayStr(): string {
  return format(new Date(), 'yyyy-MM-dd');
}

function firstOfMonthStr(): string {
  const d = new Date();
  return format(new Date(d.getFullYear(), d.getMonth(), 1), 'yyyy-MM-dd');
}

// ─── Delete Confirmation Dialog ─────────────────────────────────────────────

function DeleteConfirmDialog({
  open, onOpenChange, recordName, onConfirm,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  recordName: string;
  onConfirm: () => Promise<void>;
}) {
  const [deleting, setDeleting] = useState(false);

  async function handleDelete() {
    setDeleting(true);
    try {
      await onConfirm();
      toast.success(`"${recordName}" wurde gelöscht.`);
      onOpenChange(false);
    } catch {
      toast.error('Eintrag konnte nicht gelöscht werden.');
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AlertDialog open={open} onOpenChange={onOpenChange}>
      <AlertDialogContent>
        <AlertDialogHeader>
          <AlertDialogTitle>Eintrag löschen?</AlertDialogTitle>
          <AlertDialogDescription>
            Möchtest du &quot;{recordName}&quot; wirklich löschen? Diese Aktion kann nicht rückgängig gemacht werden.
          </AlertDialogDescription>
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

// ─── Kostengruppen Dialog ───────────────────────────────────────────────────

function KostengruppenDialog({
  open, onOpenChange, record, onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record?: Kostengruppen | null;
  onSuccess: () => void;
}) {
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
        kostengruppenname: record?.fields.kostengruppenname ?? '',
        kostengruppennummer: record?.fields.kostengruppennummer ?? '',
        beschreibung: record?.fields.beschreibung ?? '',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      if (isEditing) {
        await LivingAppsService.updateKostengruppenEntry(record!.record_id, formData);
        toast.success('Kostengruppe aktualisiert.');
      } else {
        await LivingAppsService.createKostengruppenEntry(formData);
        toast.success('Kostengruppe erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Kostengruppe bearbeiten' : 'Neue Kostengruppe'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="kg-name">Name *</Label>
            <Input
              id="kg-name"
              value={formData.kostengruppenname}
              onChange={e => setFormData(p => ({ ...p, kostengruppenname: e.target.value }))}
              required
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kg-nummer">Nummer</Label>
            <Input
              id="kg-nummer"
              value={formData.kostengruppennummer}
              onChange={e => setFormData(p => ({ ...p, kostengruppennummer: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="kg-beschreibung">Beschreibung</Label>
            <Textarea
              id="kg-beschreibung"
              value={formData.beschreibung}
              onChange={e => setFormData(p => ({ ...p, beschreibung: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Belegbuchungen Dialog ──────────────────────────────────────────────────

function BelegbuchungenDialog({
  open, onOpenChange, record, onSuccess, kostengruppen,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record?: Belegbuchungen | null;
  onSuccess: () => void;
  kostengruppen: Kostengruppen[];
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    belegdatum: todayStr(),
    belegnummer: '',
    belegbeschreibung: '',
    betrag: '',
    belegart: '',
    kostengruppe: '',
    notizen: '',
  });

  useEffect(() => {
    if (open) {
      const kgId = record?.fields.kostengruppe ? extractRecordId(record.fields.kostengruppe) : '';
      setFormData({
        belegdatum: record?.fields.belegdatum?.split('T')[0] ?? todayStr(),
        belegnummer: record?.fields.belegnummer ?? '',
        belegbeschreibung: record?.fields.belegbeschreibung ?? '',
        betrag: record?.fields.betrag != null ? String(record.fields.betrag) : '',
        belegart: record?.fields.belegart ?? '',
        kostengruppe: kgId ?? '',
        notizen: record?.fields.notizen ?? '',
      });
    }
  }, [open, record]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const apiData: Record<string, unknown> = {
        belegdatum: formData.belegdatum,
        belegnummer: formData.belegnummer || undefined,
        belegbeschreibung: formData.belegbeschreibung || undefined,
        betrag: formData.betrag ? parseFloat(formData.betrag) : undefined,
        belegart: formData.belegart || undefined,
        kostengruppe: formData.kostengruppe
          ? createRecordUrl(APP_IDS.KOSTENGRUPPEN, formData.kostengruppe)
          : null,
        notizen: formData.notizen || undefined,
      };

      if (isEditing) {
        await LivingAppsService.updateBelegbuchungenEntry(record!.record_id, apiData as Belegbuchungen['fields']);
        toast.success('Buchung aktualisiert.');
      } else {
        await LivingAppsService.createBelegbuchungenEntry(apiData as Belegbuchungen['fields']);
        toast.success('Buchung erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Buchung bearbeiten' : 'Neue Buchung erfassen'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4 max-h-[70vh] overflow-y-auto pr-1">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="bb-datum">Belegdatum *</Label>
              <Input
                id="bb-datum"
                type="date"
                value={formData.belegdatum}
                onChange={e => setFormData(p => ({ ...p, belegdatum: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="bb-betrag">Betrag (EUR) *</Label>
              <Input
                id="bb-betrag"
                type="number"
                step="0.01"
                value={formData.betrag}
                onChange={e => setFormData(p => ({ ...p, betrag: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bb-nummer">Belegnummer</Label>
            <Input
              id="bb-nummer"
              value={formData.belegnummer}
              onChange={e => setFormData(p => ({ ...p, belegnummer: e.target.value }))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="bb-beschreibung">Beschreibung</Label>
            <Textarea
              id="bb-beschreibung"
              value={formData.belegbeschreibung}
              onChange={e => setFormData(p => ({ ...p, belegbeschreibung: e.target.value }))}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Belegart</Label>
              <Select
                value={formData.belegart || 'none'}
                onValueChange={v => setFormData(p => ({ ...p, belegart: v === 'none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Auswahl</SelectItem>
                  {Object.entries(BELEGART_LABELS).map(([key, label]) => (
                    <SelectItem key={key} value={key}>{label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Kostengruppe</Label>
              <Select
                value={formData.kostengruppe || 'none'}
                onValueChange={v => setFormData(p => ({ ...p, kostengruppe: v === 'none' ? '' : v }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Auswählen..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Keine Auswahl</SelectItem>
                  {kostengruppen.map(kg => (
                    <SelectItem key={kg.record_id} value={kg.record_id}>
                      {kg.fields.kostengruppenname || kg.record_id}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="bb-notizen">Notizen</Label>
            <Textarea
              id="bb-notizen"
              value={formData.notizen}
              onChange={e => setFormData(p => ({ ...p, notizen: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Steuerberater-Übergaben Dialog ─────────────────────────────────────────

function UebergabenDialog({
  open, onOpenChange, record, onSuccess,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  record?: SteuerberaterUebergaben | null;
  onSuccess: () => void;
}) {
  const isEditing = !!record;
  const [submitting, setSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    stichtag: todayStr(),
    periode_von: firstOfMonthStr(),
    periode_bis: todayStr(),
    bemerkungen: '',
  });

  useEffect(() => {
    if (open) {
      setFormData({
        stichtag: record?.fields.stichtag?.split('T')[0] ?? todayStr(),
        periode_von: record?.fields.periode_von?.split('T')[0] ?? firstOfMonthStr(),
        periode_bis: record?.fields.periode_bis?.split('T')[0] ?? todayStr(),
        bemerkungen: record?.fields.bemerkungen ?? '',
      });
    }
  }, [open, record]);

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
        await LivingAppsService.updateSteuerberaterUebergabenEntry(record!.record_id, apiData);
        toast.success('Übergabe aktualisiert.');
      } else {
        await LivingAppsService.createSteuerberaterUebergabenEntry(apiData);
        toast.success('Übergabe erstellt.');
      }
      onOpenChange(false);
      onSuccess();
    } catch (err) {
      toast.error(`Fehler: ${err instanceof Error ? err.message : 'Unbekannt'}`);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Übergabe bearbeiten' : 'Neue Übergabe'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="ue-stichtag">Stichtag *</Label>
            <Input
              id="ue-stichtag"
              type="date"
              value={formData.stichtag}
              onChange={e => setFormData(p => ({ ...p, stichtag: e.target.value }))}
              required
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="ue-von">Periode von *</Label>
              <Input
                id="ue-von"
                type="date"
                value={formData.periode_von}
                onChange={e => setFormData(p => ({ ...p, periode_von: e.target.value }))}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="ue-bis">Periode bis *</Label>
              <Input
                id="ue-bis"
                type="date"
                value={formData.periode_bis}
                onChange={e => setFormData(p => ({ ...p, periode_bis: e.target.value }))}
                required
              />
            </div>
          </div>
          <div className="space-y-2">
            <Label htmlFor="ue-bemerkungen">Bemerkungen</Label>
            <Textarea
              id="ue-bemerkungen"
              value={formData.bemerkungen}
              onChange={e => setFormData(p => ({ ...p, bemerkungen: e.target.value }))}
            />
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>Abbrechen</Button>
            <Button type="submit" disabled={submitting}>
              {submitting ? 'Speichert...' : isEditing ? 'Speichern' : 'Erstellen'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Loading State ──────────────────────────────────────────────────────────

function LoadingState() {
  return (
    <div className="min-h-screen bg-background p-4 md:p-8">
      <div className="max-w-[1280px] mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Skeleton className="h-8 w-64" />
          <Skeleton className="h-10 w-48" />
        </div>
        <Skeleton className="h-48 w-full rounded-lg" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
          <Skeleton className="h-24 rounded-lg" />
        </div>
        <Skeleton className="h-80 w-full rounded-lg" />
      </div>
    </div>
  );
}

// ─── Error State ────────────────────────────────────────────────────────────

function ErrorState({ error, onRetry }: { error: Error; onRetry: () => void }) {
  return (
    <div className="min-h-screen bg-background flex items-center justify-center p-4">
      <Card className="max-w-md w-full">
        <CardContent className="pt-6 text-center space-y-4">
          <AlertCircle className="h-12 w-12 text-destructive mx-auto" />
          <h2 className="text-lg font-semibold">Fehler beim Laden</h2>
          <p className="text-sm text-muted-foreground">{error.message}</p>
          <Button onClick={onRetry} variant="outline">
            <RefreshCw className="h-4 w-4 mr-2" /> Erneut versuchen
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}

// ─── Empty State ────────────────────────────────────────────────────────────

function EmptyListState({ title, onAdd }: { title: string; onAdd: () => void }) {
  return (
    <div className="text-center py-8 text-muted-foreground">
      <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
      <p className="text-sm">{title}</p>
      <Button size="sm" variant="outline" className="mt-3" onClick={onAdd}>
        <Plus className="h-4 w-4 mr-1" /> Erstellen
      </Button>
    </div>
  );
}

// ─── Main Dashboard ─────────────────────────────────────────────────────────

export default function Dashboard() {
  const [buchungen, setBuchungen] = useState<Belegbuchungen[]>([]);
  const [kostengruppen, setKostengruppen] = useState<Kostengruppen[]>([]);
  const [uebergaben, setUebergaben] = useState<SteuerberaterUebergaben[]>([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  // Filter
  const [belegartFilter, setBelegartFilter] = useState('all');

  // CRUD state - Buchungen
  const [showBuchungDialog, setShowBuchungDialog] = useState(false);
  const [editBuchung, setEditBuchung] = useState<Belegbuchungen | null>(null);
  const [deleteBuchung, setDeleteBuchung] = useState<Belegbuchungen | null>(null);

  // CRUD state - Kostengruppen
  const [showKgDialog, setShowKgDialog] = useState(false);
  const [editKg, setEditKg] = useState<Kostengruppen | null>(null);
  const [deleteKg, setDeleteKg] = useState<Kostengruppen | null>(null);

  // CRUD state - Übergaben
  const [showUeDialog, setShowUeDialog] = useState(false);
  const [editUe, setEditUe] = useState<SteuerberaterUebergaben | null>(null);
  const [deleteUe, setDeleteUe] = useState<SteuerberaterUebergaben | null>(null);

  // Show more
  const [showAllBuchungen, setShowAllBuchungen] = useState(false);
  const [showAllUebergaben, setShowAllUebergaben] = useState(false);

  // ─── Data fetching ──────────────────────────────────────────────────────

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const [b, k, u] = await Promise.all([
        LivingAppsService.getBelegbuchungen(),
        LivingAppsService.getKostengruppen(),
        LivingAppsService.getSteuerberaterUebergaben(),
      ]);
      setBuchungen(b);
      setKostengruppen(k);
      setUebergaben(u);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unbekannter Fehler'));
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  const refreshBuchungen = useCallback(async () => {
    try {
      const b = await LivingAppsService.getBelegbuchungen();
      setBuchungen(b);
    } catch { /* toast already shown in dialog */ }
  }, []);

  const refreshKostengruppen = useCallback(async () => {
    try {
      const k = await LivingAppsService.getKostengruppen();
      setKostengruppen(k);
    } catch { /* toast already shown */ }
  }, []);

  const refreshUebergaben = useCallback(async () => {
    try {
      const u = await LivingAppsService.getSteuerberaterUebergaben();
      setUebergaben(u);
    } catch { /* toast already shown */ }
  }, []);

  // ─── Computed data ──────────────────────────────────────────────────────

  const kgMap = useMemo(() => {
    const m = new Map<string, Kostengruppen>();
    kostengruppen.forEach(kg => m.set(kg.record_id, kg));
    return m;
  }, [kostengruppen]);

  const totalBetrag = useMemo(
    () => buchungen.reduce((sum, b) => sum + (b.fields.betrag ?? 0), 0),
    [buchungen],
  );

  const einnahmen = useMemo(
    () => buchungen
      .filter(b => b.fields.belegart && INCOME_TYPES.includes(b.fields.belegart))
      .reduce((sum, b) => sum + (b.fields.betrag ?? 0), 0),
    [buchungen],
  );

  const ausgaben = useMemo(
    () => buchungen
      .filter(b => b.fields.belegart && EXPENSE_TYPES.includes(b.fields.belegart))
      .reduce((sum, b) => sum + (b.fields.betrag ?? 0), 0),
    [buchungen],
  );

  const belegeThisWeek = useMemo(() => {
    const now = new Date();
    const weekStart = startOfWeek(now, { weekStartsOn: 1 });
    const weekEnd = endOfWeek(now, { weekStartsOn: 1 });
    return buchungen.filter(b => {
      if (!b.fields.belegdatum) return false;
      try {
        const d = parseISO(b.fields.belegdatum.split('T')[0]);
        return isWithinInterval(d, { start: weekStart, end: weekEnd });
      } catch {
        return false;
      }
    }).length;
  }, [buchungen]);

  // Kostengruppen breakdown
  const kgBreakdown = useMemo(() => {
    const groups: { id: string; name: string; total: number }[] = [];
    const groupMap = new Map<string, number>();
    let unassigned = 0;

    buchungen.forEach(b => {
      const kgId = extractRecordId(b.fields.kostengruppe);
      const betrag = b.fields.betrag ?? 0;
      if (kgId) {
        groupMap.set(kgId, (groupMap.get(kgId) ?? 0) + betrag);
      } else {
        unassigned += betrag;
      }
    });

    groupMap.forEach((total, id) => {
      const kg = kgMap.get(id);
      groups.push({ id, name: kg?.fields.kostengruppenname || 'Unbenannt', total });
    });

    groups.sort((a, b) => b.total - a.total);
    if (unassigned > 0) {
      groups.push({ id: '_unassigned', name: 'Ohne Zuordnung', total: unassigned });
    }

    return groups;
  }, [buchungen, kgMap]);

  // Monthly chart data
  const monthlyData = useMemo(() => {
    const months = new Map<string, number>();
    buchungen.forEach(b => {
      if (!b.fields.belegdatum) return;
      const dateStr = b.fields.belegdatum.split('T')[0];
      const monthKey = dateStr.substring(0, 7); // YYYY-MM
      months.set(monthKey, (months.get(monthKey) ?? 0) + (b.fields.betrag ?? 0));
    });
    return Array.from(months.entries())
      .sort(([a], [b]) => a.localeCompare(b))
      .map(([month, total]) => {
        let label: string;
        try {
          label = format(parseISO(month + '-01'), 'MMM yyyy', { locale: de });
        } catch {
          label = month;
        }
        return { month: label, betrag: Math.round(total * 100) / 100 };
      });
  }, [buchungen]);

  // Filtered & sorted buchungen
  const sortedBuchungen = useMemo(() => {
    let filtered = [...buchungen];
    if (belegartFilter !== 'all') {
      filtered = filtered.filter(b => b.fields.belegart === belegartFilter);
    }
    return filtered.sort((a, b) => {
      const da = a.fields.belegdatum ?? '';
      const db = b.fields.belegdatum ?? '';
      return db.localeCompare(da);
    });
  }, [buchungen, belegartFilter]);

  const sortedUebergaben = useMemo(
    () => [...uebergaben].sort((a, b) => {
      const da = a.fields.stichtag ?? '';
      const db = b.fields.stichtag ?? '';
      return db.localeCompare(da);
    }),
    [uebergaben],
  );

  // ─── Render states ─────────────────────────────────────────────────────

  if (loading) return <LoadingState />;
  if (error) return <ErrorState error={error} onRetry={fetchData} />;

  const breakdownTotal = kgBreakdown.reduce((s, g) => s + g.total, 0);

  const buchungenToShow = showAllBuchungen ? sortedBuchungen : sortedBuchungen.slice(0, 20);
  const uebergabenToShow = showAllUebergaben ? sortedUebergaben : sortedUebergaben.slice(0, 5);

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 bg-background/95 backdrop-blur border-b border-border">
        <div className="max-w-[1280px] mx-auto px-4 md:px-8 py-4 flex items-center justify-between">
          <h1 className="text-xl md:text-2xl font-bold tracking-tight">Buchhaltungs-Manager</h1>
          <Button onClick={() => { setEditBuchung(null); setShowBuchungDialog(true); }} className="hidden md:flex">
            <Plus className="h-4 w-4 mr-2" /> Neue Buchung erfassen
          </Button>
        </div>
      </header>

      <main className="max-w-[1280px] mx-auto px-4 md:px-8 py-6 md:py-8">
        <div className="flex flex-col lg:flex-row gap-5 lg:gap-6">

          {/* ── Left Column (65%) ─────────────────────────────────────── */}
          <div className="lg:w-[65%] space-y-5 lg:space-y-6">

            {/* Hero KPI */}
            <Card className="border-l-4 border-l-primary shadow-sm hover:shadow-md transition-shadow">
              <CardContent className="p-6 md:p-8">
                <p className="text-xs font-light tracking-widest uppercase text-muted-foreground mb-1">
                  Gesamtbetrag
                </p>
                <p className="text-4xl md:text-5xl font-bold tracking-tight">
                  {formatCurrency(totalBetrag)}
                </p>
                <p className="text-sm text-muted-foreground mt-1">
                  aus {buchungen.length} Buchungen
                </p>

                {/* Breakdown bar */}
                {kgBreakdown.length > 0 && breakdownTotal > 0 && (
                  <div className="mt-6">
                    <div className="flex h-3 rounded-full overflow-hidden bg-muted">
                      {kgBreakdown.map((g, i) => {
                        const pct = (g.total / breakdownTotal) * 100;
                        if (pct < 0.5) return null;
                        return (
                          <div
                            key={g.id}
                            className="h-full transition-all relative group"
                            style={{
                              width: `${pct}%`,
                              backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length],
                            }}
                            title={`${g.name}: ${formatCurrency(g.total)} (${pct.toFixed(1)}%)`}
                          />
                        );
                      })}
                    </div>
                    <div className="flex flex-wrap gap-x-4 gap-y-1 mt-3">
                      {kgBreakdown.map((g, i) => (
                        <div key={g.id} className="flex items-center gap-1.5 text-xs text-muted-foreground">
                          <span
                            className="w-2.5 h-2.5 rounded-full inline-block flex-shrink-0"
                            style={{ backgroundColor: CATEGORY_COLORS[i % CATEGORY_COLORS.length] }}
                          />
                          <span>{g.name}</span>
                          <span className="font-medium text-foreground">{formatCurrency(g.total)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Quick Stats - Mobile only */}
            <div className="flex gap-3 overflow-x-auto pb-1 lg:hidden snap-x snap-mandatory">
              <div className="flex-shrink-0 snap-start bg-card rounded-lg border px-4 py-3 min-w-[140px] border-l-4 border-l-[hsl(152_55%_40%)]">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <TrendingUp className="h-3 w-3 text-[hsl(152,55%,40%)]" /> Einnahmen
                </div>
                <p className="text-lg font-bold">{formatCurrency(einnahmen)}</p>
              </div>
              <div className="flex-shrink-0 snap-start bg-card rounded-lg border px-4 py-3 min-w-[140px] border-l-4 border-l-destructive">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <TrendingDown className="h-3 w-3 text-destructive" /> Ausgaben
                </div>
                <p className="text-lg font-bold">{formatCurrency(ausgaben)}</p>
              </div>
              <div className="flex-shrink-0 snap-start bg-card rounded-lg border px-4 py-3 min-w-[140px] border-l-4 border-l-primary">
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-1">
                  <Receipt className="h-3 w-3 text-primary" /> Diese Woche
                </div>
                <p className="text-lg font-bold">{belegeThisWeek}</p>
              </div>
            </div>

            {/* Chart */}
            <Card className="shadow-sm">
              <CardHeader className="pb-2">
                <CardTitle className="text-lg font-semibold">Monatsverlauf</CardTitle>
              </CardHeader>
              <CardContent>
                {monthlyData.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-12">Noch keine Daten vorhanden.</p>
                ) : (
                  <div className="h-[240px] md:h-[320px]">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={monthlyData} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                        <defs>
                          <linearGradient id="areaFill" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="hsl(185 62% 34%)" stopOpacity={0.2} />
                            <stop offset="95%" stopColor="hsl(185 62% 34%)" stopOpacity={0} />
                          </linearGradient>
                        </defs>
                        <XAxis
                          dataKey="month"
                          tick={{ fontSize: 11 }}
                          stroke="hsl(215 15% 50%)"
                          tickLine={false}
                          axisLine={false}
                        />
                        <YAxis
                          tick={{ fontSize: 11 }}
                          stroke="hsl(215 15% 50%)"
                          tickLine={false}
                          axisLine={false}
                          tickFormatter={v => `${(v / 1000).toFixed(0)}k`}
                          className="hidden md:block"
                          hide={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: 'hsl(0 0% 100%)',
                            border: '1px solid hsl(210 18% 90%)',
                            borderRadius: '8px',
                            fontSize: '13px',
                          }}
                          formatter={(value: number) => [formatCurrency(value), 'Betrag']}
                        />
                        <Area
                          type="monotone"
                          dataKey="betrag"
                          stroke="hsl(185 62% 34%)"
                          strokeWidth={2}
                          fill="url(#areaFill)"
                        />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Belegbuchungen Table / List */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between flex-wrap gap-3">
                  <CardTitle className="text-lg font-semibold">Belegbuchungen</CardTitle>
                  <div className="flex items-center gap-2">
                    <Select
                      value={belegartFilter}
                      onValueChange={setBelegartFilter}
                    >
                      <SelectTrigger className="w-[180px] h-8 text-sm">
                        <SelectValue placeholder="Alle Belegarten" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Alle Belegarten</SelectItem>
                        {Object.entries(BELEGART_LABELS).map(([key, label]) => (
                          <SelectItem key={key} value={key}>{label}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => { setEditBuchung(null); setShowBuchungDialog(true); }}
                    >
                      <Plus className="h-4 w-4 mr-1" /> Neu
                    </Button>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                {sortedBuchungen.length === 0 ? (
                  <EmptyListState title="Noch keine Buchungen vorhanden." onAdd={() => { setEditBuchung(null); setShowBuchungDialog(true); }} />
                ) : (
                  <>
                    {/* Desktop Table */}
                    <div className="hidden md:block overflow-x-auto">
                      <Table>
                        <TableHeader>
                          <TableRow>
                            <TableHead className="w-[100px]">Datum</TableHead>
                            <TableHead>Belegnr.</TableHead>
                            <TableHead className="hidden lg:table-cell">Beschreibung</TableHead>
                            <TableHead>Belegart</TableHead>
                            <TableHead className="hidden lg:table-cell">Kostengruppe</TableHead>
                            <TableHead className="text-right">Betrag</TableHead>
                            <TableHead className="w-[80px]" />
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {buchungenToShow.map(b => {
                            const kgId = extractRecordId(b.fields.kostengruppe);
                            const kgName = kgId ? kgMap.get(kgId)?.fields.kostengruppenname : null;
                            return (
                              <TableRow key={b.record_id} className="group hover:bg-muted/50 transition-colors">
                                <TableCell className="text-sm">{formatDate(b.fields.belegdatum)}</TableCell>
                                <TableCell className="text-sm font-medium">{b.fields.belegnummer || '-'}</TableCell>
                                <TableCell className="text-sm text-muted-foreground hidden lg:table-cell max-w-[200px] truncate">
                                  {b.fields.belegbeschreibung || '-'}
                                </TableCell>
                                <TableCell>
                                  {b.fields.belegart ? (
                                    <Badge variant="secondary" className="text-xs font-normal">
                                      {BELEGART_LABELS[b.fields.belegart] || b.fields.belegart}
                                    </Badge>
                                  ) : '-'}
                                </TableCell>
                                <TableCell className="text-sm hidden lg:table-cell">{kgName || '-'}</TableCell>
                                <TableCell className="text-right font-medium text-sm">
                                  {formatCurrency(b.fields.betrag)}
                                </TableCell>
                                <TableCell>
                                  <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7"
                                      onClick={() => { setEditBuchung(b); setShowBuchungDialog(true); }}
                                    >
                                      <Pencil className="h-3.5 w-3.5" />
                                    </Button>
                                    <Button
                                      variant="ghost"
                                      size="icon"
                                      className="h-7 w-7 text-destructive hover:text-destructive"
                                      onClick={() => setDeleteBuchung(b)}
                                    >
                                      <Trash2 className="h-3.5 w-3.5" />
                                    </Button>
                                  </div>
                                </TableCell>
                              </TableRow>
                            );
                          })}
                        </TableBody>
                      </Table>
                    </div>

                    {/* Mobile List */}
                    <div className="md:hidden space-y-2">
                      {buchungenToShow.map(b => {
                        const kgId = extractRecordId(b.fields.kostengruppe);
                        const kgName = kgId ? kgMap.get(kgId)?.fields.kostengruppenname : null;
                        return (
                          <div
                            key={b.record_id}
                            className="flex items-center justify-between p-3 rounded-lg border bg-card hover:bg-muted/50 transition-colors"
                          >
                            <div className="flex-1 min-w-0 mr-3">
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-medium truncate">{b.fields.belegnummer || 'Ohne Nr.'}</span>
                                {b.fields.belegart && (
                                  <Badge variant="secondary" className="text-[10px] font-normal flex-shrink-0">
                                    {BELEGART_LABELS[b.fields.belegart] || b.fields.belegart}
                                  </Badge>
                                )}
                              </div>
                              <p className="text-xs text-muted-foreground truncate mt-0.5">
                                {formatDate(b.fields.belegdatum)}
                                {kgName && ` · ${kgName}`}
                              </p>
                            </div>
                            <div className="flex items-center gap-2 flex-shrink-0">
                              <span className="font-semibold text-sm">{formatCurrency(b.fields.betrag)}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => { setEditBuchung(b); setShowBuchungDialog(true); }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive"
                                onClick={() => setDeleteBuchung(b)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {!showAllBuchungen && sortedBuchungen.length > 20 && (
                      <div className="text-center mt-4">
                        <Button variant="ghost" size="sm" onClick={() => setShowAllBuchungen(true)}>
                          Alle {sortedBuchungen.length} Buchungen anzeigen
                        </Button>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

          {/* ── Right Column (35%) ────────────────────────────────────── */}
          <div className="lg:w-[35%] space-y-5 lg:space-y-6">

            {/* Quick Stats - Desktop only */}
            <div className="hidden lg:block space-y-0">
              <Card className="rounded-b-none border-b-0 border-l-4 border-l-[hsl(152,55%,40%)] shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <TrendingUp className="h-3.5 w-3.5 text-[hsl(152,55%,40%)]" /> Einnahmen
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(einnahmen)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-none border-b-0 border-l-4 border-l-destructive shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <TrendingDown className="h-3.5 w-3.5 text-destructive" /> Ausgaben
                  </div>
                  <p className="text-xl font-bold">{formatCurrency(ausgaben)}</p>
                </CardContent>
              </Card>
              <Card className="rounded-t-none border-l-4 border-l-primary shadow-sm">
                <CardContent className="p-4">
                  <div className="flex items-center gap-2 text-xs text-muted-foreground mb-1">
                    <Receipt className="h-3.5 w-3.5 text-primary" /> Belege diese Woche
                  </div>
                  <p className="text-xl font-bold">{belegeThisWeek}</p>
                </CardContent>
              </Card>
            </div>

            {/* Kostengruppen */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Kostengruppen</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => { setEditKg(null); setShowKgDialog(true); }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {kostengruppen.length === 0 ? (
                  <EmptyListState title="Noch keine Kostengruppen." onAdd={() => { setEditKg(null); setShowKgDialog(true); }} />
                ) : (
                  <div className="space-y-1">
                    {[...kostengruppen]
                      .sort((a, b) => (a.fields.kostengruppenname ?? '').localeCompare(b.fields.kostengruppenname ?? ''))
                      .map(kg => {
                        const kgTotal = buchungen
                          .filter(b => extractRecordId(b.fields.kostengruppe) === kg.record_id)
                          .reduce((s, b) => s + (b.fields.betrag ?? 0), 0);
                        return (
                          <div
                            key={kg.record_id}
                            className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                          >
                            <div className="min-w-0">
                              <p className="text-sm font-medium">{kg.fields.kostengruppenname || 'Unbenannt'}</p>
                              <p className="text-xs text-muted-foreground">
                                {kg.fields.kostengruppennummer && `Nr. ${kg.fields.kostengruppennummer} · `}
                                {formatCurrency(kgTotal)}
                              </p>
                            </div>
                            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={() => { setEditKg(kg); setShowKgDialog(true); }}
                              >
                                <Pencil className="h-3.5 w-3.5" />
                              </Button>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => setDeleteKg(kg)}
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </Button>
                            </div>
                          </div>
                        );
                      })}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Steuerberater-Übergaben */}
            <Card className="shadow-sm">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-lg font-semibold">Übergaben</CardTitle>
                  <Button
                    size="icon"
                    variant="ghost"
                    className="h-8 w-8"
                    onClick={() => { setEditUe(null); setShowUeDialog(true); }}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {uebergaben.length === 0 ? (
                  <EmptyListState title="Noch keine Übergaben." onAdd={() => { setEditUe(null); setShowUeDialog(true); }} />
                ) : (
                  <div className="space-y-1">
                    {uebergabenToShow.map(ue => (
                      <div
                        key={ue.record_id}
                        className="group flex items-center justify-between p-2.5 rounded-lg hover:bg-muted/50 transition-colors"
                      >
                        <div className="min-w-0">
                          <p className="text-sm font-medium">Stichtag: {formatDate(ue.fields.stichtag)}</p>
                          <p className="text-xs text-muted-foreground">
                            Periode: {formatDate(ue.fields.periode_von)} - {formatDate(ue.fields.periode_bis)}
                          </p>
                          {ue.fields.bemerkungen && (
                            <p className="text-xs text-muted-foreground truncate max-w-[200px] mt-0.5">
                              {ue.fields.bemerkungen}
                            </p>
                          )}
                        </div>
                        <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0">
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7"
                            onClick={() => { setEditUe(ue); setShowUeDialog(true); }}
                          >
                            <Pencil className="h-3.5 w-3.5" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-7 w-7 text-destructive hover:text-destructive"
                            onClick={() => setDeleteUe(ue)}
                          >
                            <Trash2 className="h-3.5 w-3.5" />
                          </Button>
                        </div>
                      </div>
                    ))}
                    {!showAllUebergaben && sortedUebergaben.length > 5 && (
                      <div className="text-center mt-2">
                        <Button variant="ghost" size="sm" onClick={() => setShowAllUebergaben(true)}>
                          Alle {sortedUebergaben.length} anzeigen
                        </Button>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </div>
      </main>

      {/* ── Mobile FAB ──────────────────────────────────────────────── */}
      <button
        className="md:hidden fixed bottom-6 right-6 z-40 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center hover:scale-105 active:scale-95 transition-transform"
        onClick={() => { setEditBuchung(null); setShowBuchungDialog(true); }}
        aria-label="Neue Buchung erfassen"
      >
        <Plus className="h-6 w-6" />
      </button>

      {/* ── Dialogs ─────────────────────────────────────────────────── */}
      <BelegbuchungenDialog
        open={showBuchungDialog}
        onOpenChange={setShowBuchungDialog}
        record={editBuchung}
        onSuccess={refreshBuchungen}
        kostengruppen={kostengruppen}
      />

      <KostengruppenDialog
        open={showKgDialog}
        onOpenChange={setShowKgDialog}
        record={editKg}
        onSuccess={refreshKostengruppen}
      />

      <UebergabenDialog
        open={showUeDialog}
        onOpenChange={setShowUeDialog}
        record={editUe}
        onSuccess={refreshUebergaben}
      />

      <DeleteConfirmDialog
        open={!!deleteBuchung}
        onOpenChange={v => { if (!v) setDeleteBuchung(null); }}
        recordName={deleteBuchung?.fields.belegnummer || 'Buchung'}
        onConfirm={async () => {
          if (!deleteBuchung) return;
          await LivingAppsService.deleteBelegbuchungenEntry(deleteBuchung.record_id);
          setDeleteBuchung(null);
          refreshBuchungen();
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteKg}
        onOpenChange={v => { if (!v) setDeleteKg(null); }}
        recordName={deleteKg?.fields.kostengruppenname || 'Kostengruppe'}
        onConfirm={async () => {
          if (!deleteKg) return;
          await LivingAppsService.deleteKostengruppenEntry(deleteKg.record_id);
          setDeleteKg(null);
          refreshKostengruppen();
        }}
      />

      <DeleteConfirmDialog
        open={!!deleteUe}
        onOpenChange={v => { if (!v) setDeleteUe(null); }}
        recordName={deleteUe?.fields.stichtag ? `Übergabe vom ${formatDate(deleteUe.fields.stichtag)}` : 'Übergabe'}
        onConfirm={async () => {
          if (!deleteUe) return;
          await LivingAppsService.deleteSteuerberaterUebergabenEntry(deleteUe.record_id);
          setDeleteUe(null);
          refreshUebergaben();
        }}
      />
    </div>
  );
}
