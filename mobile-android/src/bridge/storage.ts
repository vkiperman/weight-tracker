import { Preferences } from '@capacitor/preferences';

export type WeightEntry = { dateISO: string; weightKg: number };

const KEY = 'weight_entries_v1';

export async function loadWeights(): Promise<WeightEntry[]> {
  const { value } = await Preferences.get({ key: KEY });
  return value ? JSON.parse(value) : [];
}

export async function saveWeights(rows: WeightEntry[]) {
  await Preferences.set({ key: KEY, value: JSON.stringify(rows) });
}
