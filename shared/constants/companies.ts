export interface CompanyMeta {
  id: string;
  name: string;
  csvFile: string;
}

export const COMPANIES: CompanyMeta[] = [
  { id: 'google', name: 'Google', csvFile: 'google.csv' },
  { id: 'amazon', name: 'Amazon', csvFile: 'amazon.csv' },
  { id: 'meta', name: 'Meta', csvFile: 'meta.csv' },
  { id: 'microsoft', name: 'Microsoft', csvFile: 'microsoft.csv' },
  { id: 'apple', name: 'Apple', csvFile: 'apple.csv' },
  { id: 'netflix', name: 'Netflix', csvFile: 'netflix.csv' },
  { id: 'uber', name: 'Uber', csvFile: 'uber.csv' },
  { id: 'bloomberg', name: 'Bloomberg', csvFile: 'bloomberg.csv' },
  { id: 'adobe', name: 'Adobe', csvFile: 'adobe.csv' },
  { id: 'oracle', name: 'Oracle', csvFile: 'oracle.csv' },
];

export const COMPANY_IDS = COMPANIES.map((c) => c.id);
