
// --- 1. ТИПЫ (Глобальные определения) ---

export type TrainingsperWeek = 2 | 3 | 4 | 5;
export type SplitType = 
  | 'full-body' 
  | 'upper-lower' 
  | 'push-pull-legs' 
  | 'arnold-split' 
  | 'upper-lower + full-body';
export type Goal = 'bulk' | 'cut' | 'maintain';
export type Gender = "Male" | "Female"
export type ActivityLevel = 1.2 | 1.375 | 1.55 | 1.725 | 1.9;



export interface UserStats {
    experienceLevel: ExperienceLevel;
    weight: number;
    height: number;
    age: number;
    activitylevel: ActivityLevel;
    goal: Goal;
  gender: Gender;
  trainingsPerWeek: TrainingsperWeek;
}

export type ExperienceLevel = 'beginner' | 'intermediate' | 'advanced';

export interface CalculationResult {
  calories: number;
  protein: number;
  fats: number;
  carbs: number;
  splits: SplitType[];
}