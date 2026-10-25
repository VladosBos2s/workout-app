import { useState } from "react";
import type { UserStats } from "../../../shared/types";
import { calculateCalories, getSuggestedSplits, calculateMacros } from "../../../shared/utils";

import type { CalculationResult } from "../../../shared/types";
const DEFAULT_STATS: UserStats = {
    activitylevel: 1.2,
    age: 20,
    experienceLevel: 'beginner',
    gender: "Male",
    goal: "maintain",
    height: 175,
    weight: 70,
    trainingsPerWeek: 3,
}

export function useCalculator() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [stats, setStats] = useState<UserStats>(DEFAULT_STATS);
    const [result, setResult] = useState<CalculationResult | null>(null);

    const handleCalculate = () => {
        const calories = calculateCalories(stats)
        const { protein, carbs, fats } = calculateMacros(stats);
        const splits = getSuggestedSplits(stats.trainingsPerWeek);
         console.log({ calories, protein, fats, carbs, splits })
        setResult({ calories, protein, carbs, fats, splits });
          setIsModalOpen(true);
    }
  
    return { stats, setStats, result, handleCalculate, isModalOpen, setIsModalOpen };
}