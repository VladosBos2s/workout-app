import type { SplitType, TrainingsperWeek } from "../../shared/types";
import type { MuscleGroup } from "../Exercises/types";

export interface TrainingDay {
  name: string;        // "День 1 — Всё тело"
  muscleGroups: MuscleGroup[];  // что качаем
  exercisesPerGroup: number;    // сколько упражнений
}

// Полный план
export interface TrainingPlan {
  split: SplitType;
  daysPerWeek: TrainingsperWeek;
  days: TrainingDay[];
  durationWeeks: number;   // 2 месяца
}