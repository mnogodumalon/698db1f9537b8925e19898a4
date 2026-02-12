// AUTOMATICALLY GENERATED SERVICE
import { APP_IDS } from '@/types/app';
import type { Kostengruppen, Belegbuchungen, SteuerberaterUebergaben } from '@/types/app';

// Base Configuration
const API_BASE_URL = 'https://my.living-apps.de/rest';

// --- HELPER FUNCTIONS ---
export function extractRecordId(url: string | null | undefined): string | null {
  if (!url) return null;
  // Extrahiere die letzten 24 Hex-Zeichen mit Regex
  const match = url.match(/([a-f0-9]{24})$/i);
  return match ? match[1] : null;
}

export function createRecordUrl(appId: string, recordId: string): string {
  return `https://my.living-apps.de/rest/apps/${appId}/records/${recordId}`;
}

async function callApi(method: string, endpoint: string, data?: any) {
  const response = await fetch(`${API_BASE_URL}${endpoint}`, {
    method,
    headers: { 'Content-Type': 'application/json' },
    credentials: 'include',  // Nutze Session Cookies für Auth
    body: data ? JSON.stringify(data) : undefined
  });
  if (!response.ok) throw new Error(await response.text());
  // DELETE returns often empty body or simple status
  if (method === 'DELETE') return true;
  return response.json();
}

export class LivingAppsService {
  // --- KOSTENGRUPPEN ---
  static async getKostengruppen(): Promise<Kostengruppen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.KOSTENGRUPPEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getKostengruppenEntry(id: string): Promise<Kostengruppen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.KOSTENGRUPPEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createKostengruppenEntry(fields: Kostengruppen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.KOSTENGRUPPEN}/records`, { fields });
  }
  static async updateKostengruppenEntry(id: string, fields: Partial<Kostengruppen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.KOSTENGRUPPEN}/records/${id}`, { fields });
  }
  static async deleteKostengruppenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.KOSTENGRUPPEN}/records/${id}`);
  }

  // --- BELEGBUCHUNGEN ---
  static async getBelegbuchungen(): Promise<Belegbuchungen[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.BELEGBUCHUNGEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getBelegbuchungenEntry(id: string): Promise<Belegbuchungen | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.BELEGBUCHUNGEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createBelegbuchungenEntry(fields: Belegbuchungen['fields']) {
    return callApi('POST', `/apps/${APP_IDS.BELEGBUCHUNGEN}/records`, { fields });
  }
  static async updateBelegbuchungenEntry(id: string, fields: Partial<Belegbuchungen['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.BELEGBUCHUNGEN}/records/${id}`, { fields });
  }
  static async deleteBelegbuchungenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.BELEGBUCHUNGEN}/records/${id}`);
  }

  // --- STEUERBERATER_UEBERGABEN ---
  static async getSteuerberaterUebergaben(): Promise<SteuerberaterUebergaben[]> {
    const data = await callApi('GET', `/apps/${APP_IDS.STEUERBERATER_UEBERGABEN}/records`);
    return Object.entries(data).map(([id, rec]: [string, any]) => ({
      record_id: id, ...rec
    }));
  }
  static async getSteuerberaterUebergabenEntry(id: string): Promise<SteuerberaterUebergaben | undefined> {
    const data = await callApi('GET', `/apps/${APP_IDS.STEUERBERATER_UEBERGABEN}/records/${id}`);
    return { record_id: data.id, ...data };
  }
  static async createSteuerberaterUebergabenEntry(fields: SteuerberaterUebergaben['fields']) {
    return callApi('POST', `/apps/${APP_IDS.STEUERBERATER_UEBERGABEN}/records`, { fields });
  }
  static async updateSteuerberaterUebergabenEntry(id: string, fields: Partial<SteuerberaterUebergaben['fields']>) {
    return callApi('PATCH', `/apps/${APP_IDS.STEUERBERATER_UEBERGABEN}/records/${id}`, { fields });
  }
  static async deleteSteuerberaterUebergabenEntry(id: string) {
    return callApi('DELETE', `/apps/${APP_IDS.STEUERBERATER_UEBERGABEN}/records/${id}`);
  }

}