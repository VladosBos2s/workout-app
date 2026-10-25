export type MuscleGroup = 
  | 'Грудные' 
  | 'Спина' 
  | 'Ноги' 
  | 'Плечи' 
  | 'Бицепс' 
  | 'Трицепс' 
  | 'Пресс'
  | 'Икры'
  | 'Кардио';

export interface Exercise {
  id: number;
  title: string;
  muscleGroup: MuscleGroup;
  description?: string;
  videoUrl?: string;
  loads:  ExerciseLoads;
  sets?: ExerciseSets;
  reps?: number | string;
  unit?: 'кг' | 'минут' | "км" | "собственный вес";
  
}

export interface ExerciseLoads {
  beginner: number | string;
  intermediate: number | string;
  advanced: number | string;
}
export interface ExerciseSets {
  'full-body': number;
  'upper-lower': number;
  'push-pull-legs': number;
  'arnold-split': number;
  'upper-lower + full-body': number;
}
