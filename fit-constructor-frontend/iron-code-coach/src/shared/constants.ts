import type { Goal, ActivityLevel, ExperienceLevel, SplitType, TrainingsperWeek } from "./types";
import type { MuscleGroup } from "../Features/Exercises/types";

// --- 1. SETTINGS AND DICTIONARIES ---

// Mapping workout frequency per week to recommended split types
export const TRAINING_OPTIONS: Record<TrainingsperWeek, SplitType[]> = {
  2: ['full-body'],
  3: ['full-body', 'upper-lower + full-body'],
  4: ['upper-lower'],
  5: ['upper-lower', 'push-pull-legs', 'arnold-split'],
};

export const DEFAULT_WORKOUTS_PER_WEEK: TrainingsperWeek = 3;

// Calorie adjustments for specific goals
export const CALORIE_MODIFIERS = {
  BULK: 300,
  CUT: 300,
} as const;

export const MUSCLE_GROUPS: MuscleGroup[] = [
  'Грудные', 'Спина', 'Ноги', 'Плечи', 'Бицепс', 'Трицепс', 'Кардио'
];

export const version: string = '0.0.1';

// Activity level options with i18n translation keys
export const ACTIVITY_OPTIONS: { labelKey: string; value: ActivityLevel }[] = [
   { labelKey: 'constants.activity.sedentary', value: 1.2 },
   { labelKey: 'constants.activity.light', value: 1.375 },
   { labelKey: 'constants.activity.moderate', value: 1.55 },
   { labelKey: 'constants.activity.high', value: 1.725 },
   { labelKey: 'constants.activity.extreme', value: 1.9 }
] as const;

// Fitness goal options with i18n translation keys
export const GOAL_OPTIONS: { labelKey: string; value: Goal }[] = [
    { labelKey: 'constants.goal.bulk', value: 'bulk' },
    { labelKey: 'constants.goal.cut', value: 'cut' },
    { labelKey: 'constants.goal.maintain', value: 'maintain' }
] as const;

// Training experience level options with i18n translation keys
export const EXPERIENCE_LEVEL_OPTIONS: { labelKey: string; value: ExperienceLevel }[] = [
    { labelKey: 'constants.experience.beginner', value: 'beginner' },
    { labelKey: 'constants.experience.intermediate', value: 'intermediate' },
    { labelKey: 'constants.experience.advanced', value: 'advanced' }
] as const;

// Weekly training frequency options with numeric value and translation key
export const TRAINING_FREQUENCY_OPTIONS: { labelKey: string; value: number }[] = [
  { labelKey: 'constants.frequency.timesPerWeek', value: 2 },
  { labelKey: 'constants.frequency.timesPerWeek', value: 3 },
  { labelKey: 'constants.frequency.timesPerWeek', value: 4 },
  { labelKey: 'constants.frequency.timesPerWeek', value: 5 }
] as const;