// AUTOMATICALLY GENERATED TYPES - DO NOT EDIT

export interface Kostengruppen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    kostengruppenbild?: string;
    kostengruppenname?: string;
    kostengruppennummer?: string;
    beschreibung?: string;
  };
}

export interface Belegbuchungen {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    belegdatum?: string; // Format: YYYY-MM-DD oder ISO String
    belegnummer?: string;
    belegbeschreibung?: string;
    betrag?: number;
    belegart?: 'ausgangsrechnung' | 'quittung' | 'kassenbeleg' | 'bankbeleg' | 'gutschrift' | 'sonstiger_beleg' | 'eingangsrechnung';
    kostengruppe?: string; // applookup -> URL zu 'Kostengruppen' Record
    belegdatei?: string;
    notizen?: string;
  };
}

export interface SteuerberaterUebergaben {
  record_id: string;
  createdat: string;
  updatedat: string | null;
  fields: {
    stichtag?: string; // Format: YYYY-MM-DD oder ISO String
    periode_von?: string; // Format: YYYY-MM-DD oder ISO String
    periode_bis?: string; // Format: YYYY-MM-DD oder ISO String
    uebergebene_buchungen?: string; // applookup -> URL zu 'Belegbuchungen' Record
    bemerkungen?: string;
  };
}

export const APP_IDS = {
  KOSTENGRUPPEN: '698db1e550eb37f16846d889',
  BELEGBUCHUNGEN: '698db1eaa3041ca34d1f38c4',
  STEUERBERATER_UEBERGABEN: '698db1ead8a6024900573129',
} as const;

// Helper Types for creating new records
export type CreateKostengruppen = Kostengruppen['fields'];
export type CreateBelegbuchungen = Belegbuchungen['fields'];
export type CreateSteuerberaterUebergaben = SteuerberaterUebergaben['fields'];