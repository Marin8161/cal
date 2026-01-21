
export interface FoodItem {
  id: string;
  name: string;
  caloriesPer100g: number;
  protein: number;
  carbs: number;
  fat: number;
  estimatedWeight: number; // in grams
  confidence: number;
}

export interface DailyLog {
  id: string;
  timestamp: number;
  foodName: string;
  totalCalories: number;
  protein: number;
  carbs: number;
  fat: number;
  weight: number;
  imageUrl?: string;
}

export interface UserProfile {
  height: number;
  weight: number;
  targetWeight: number;
  gender: 'male' | 'female';
  age: number;
  activityLevel: 1.2 | 1.375 | 1.55 | 1.725; // Sedentary to Very Active
  goal: 'lose' | 'maintain' | 'gain';
}

export type AppState = 'HOME' | 'SCANNING' | 'ANALYZING' | 'RESULT' | 'HISTORY' | 'PROFILE';
