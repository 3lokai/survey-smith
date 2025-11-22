import { SurveySection } from './generatePrompt';
import { SurveyInput } from '@/components/InputForm';

export interface LocalStorageSurvey {
  id: string;
  surveyRequest: {
    brandName: string;
    brandDescription: string | null;
    brandCategory: string | null;
    brandMarket: string | null;
    context: string;
    goals: string;
    audience: string;
    questionCount: number;
    createdAt: string;
  };
  sections: SurveySection[];
  inputData: SurveyInput;
}

const STORAGE_KEY = 'surveysmith_local_surveys';

export function saveSurveyToLocalStorage(
  surveyRequest: LocalStorageSurvey['surveyRequest'],
  sections: SurveySection[],
  inputData: SurveyInput
): string {
  const id = `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  const survey: LocalStorageSurvey = {
    id,
    surveyRequest,
    sections,
    inputData,
  };

  const existing = getSurveysFromLocalStorage();
  existing.push(survey);
  
  // Keep only last 50 surveys to avoid storage issues
  const trimmed = existing.slice(-50);
  
  localStorage.setItem(STORAGE_KEY, JSON.stringify(trimmed));
  return id;
}

export function getSurveysFromLocalStorage(): LocalStorageSurvey[] {
  if (typeof window === 'undefined') return [];
  
  try {
    const data = localStorage.getItem(STORAGE_KEY);
    if (!data) return [];
    return JSON.parse(data) as LocalStorageSurvey[];
  } catch (error) {
    console.error('Error reading from localStorage:', error);
    return [];
  }
}

export function getSurveyFromLocalStorage(id: string): LocalStorageSurvey | null {
  const surveys = getSurveysFromLocalStorage();
  return surveys.find(s => s.id === id) || null;
}

export function deleteSurveyFromLocalStorage(id: string): void {
  const surveys = getSurveysFromLocalStorage();
  const filtered = surveys.filter(s => s.id !== id);
  localStorage.setItem(STORAGE_KEY, JSON.stringify(filtered));
}

export function clearLocalStorageSurveys(): void {
  localStorage.removeItem(STORAGE_KEY);
}

