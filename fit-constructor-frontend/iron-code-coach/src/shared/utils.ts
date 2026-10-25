
import type { SplitType, TrainingsperWeek, UserStats, } from "./types";
import { TRAINING_OPTIONS, CALORIE_MODIFIERS } from "./constants";
// --- 3. ФУНКЦИИ (Бизнес-логика) ---


/**
 * Возвращает доступные планы тренировок на основе частоты посещений
 */
export const getSuggestedSplits = (trainingsPerWeek: TrainingsperWeek): SplitType[] => {
  return TRAINING_OPTIONS[trainingsPerWeek] || [];
};



export function calculateCalories(stats: UserStats): number {
    const { weight, height, age, activitylevel, goal, gender } = stats;

    if (!weight || !height || !age) {
    return 0;
  }
    // считаем BMR (базовый обмен веществ) по формуле Миффлина-Сан Жеора
    let bmr: number = 10 * weight + 6.25 * height - 5 * age;
    bmr = gender === 'Male' ? bmr + 5 : bmr - 161; // корректировка на пол ( девушки сжигают меньше калорий)
    let CaloriesCount: number = bmr * activitylevel; 
    switch (goal) {
        case 'bulk': return Math.round(CaloriesCount + CALORIE_MODIFIERS.BULK);
        case 'cut': return Math.round(CaloriesCount - CALORIE_MODIFIERS.CUT);
        case 'maintain': return Math.round(CaloriesCount);
        default: return Math.round(CaloriesCount);
    }
}

export function calculateMacros(stats: UserStats): { protein: number; carbs: number; fats: number } {
    const { weight, goal } = stats;
    const proteinPerKg = goal === 'bulk' ? 1.8 : goal === 'cut' ? 2 : 1.5; // белок для набора, сушки и поддержания
    const fatsPerKg = goal === 'bulk' ? 1.3 : goal === 'cut' ? 0.8 : 1; // жиры для набора, сушки и поддержания

    const protein = Math.round(proteinPerKg * weight);
    const fats = Math.round(fatsPerKg * weight);
    const carbs = Math.round((calculateCalories(stats) - (protein * 4 + fats * 9)) / 4); // углеводы - остаток калорий после белков и жиров
    return { protein, carbs, fats };
}