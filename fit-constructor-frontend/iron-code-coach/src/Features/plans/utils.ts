import i18n from 'i18next';
import type { SplitType, ExperienceLevel } from '../../shared/types';
import type { Exercise, MuscleGroup } from '../Exercises/types';

export function getExercisesForDay(
  allExercises: Exercise[],
  userSplit: SplitType,
  userLevel: ExperienceLevel,
  muscleGroups: MuscleGroup[],
  exercisesPerGroup: number,
  dayOffset: number = 0,
) {
  // Convert to lowercase and strip hyphens to match fullbody / full-body
  const isFullBody = userSplit.toLowerCase().replace('-', '') === 'fullbody';

  const allSelectedExercises = muscleGroups.flatMap(group => {
    const groupExercises = allExercises.filter(ex => ex.muscleGroup === group);
    
    if (groupExercises.length === 0) return [];
    
    const isLegs = group === 'Ноги';
    
    // Set base exercise limit for each specific muscle group
    let currentLimit = exercisesPerGroup;
    if (isFullBody) {
      currentLimit = 1; // Strictly 1 exercise per muscle group in full-body
    } else {
      currentLimit = isLegs ? 4 : 2; // Split routines: 4 for legs, 2 for upper body
    }

    const selected: Exercise[] = [];
    const offsetIndex = isFullBody ? dayOffset % 2 : dayOffset;
    
    for (let i = 0; i < currentLimit; i++) {
      const index = (offsetIndex * currentLimit + i) % groupExercises.length;
      const exercise = groupExercises[index];
      if (selected.includes(exercise)) break;
      selected.push(exercise);
    }
    
    return selected;
  }); 

  // Strict filtering for full-body routines
  if (isFullBody) {
    const finalExercises = [];
    let legsCount = 0;

    for (const ex of allSelectedExercises) {
      const isLegs = ex.muscleGroup === 'Ноги';

      if (isLegs) {
        // Limit leg exercises to a maximum of 1 for full-body
        if (legsCount >= 1) continue; 
        legsCount++;
      }
      
      finalExercises.push(ex);
    }

    return finalExercises.map(ex => ({
      id: ex.id,
      title: ex.title,
      muscleGroups: ex.muscleGroup,
      baseLoad: ex.loads[userLevel],
      sets: ex.sets?.[userSplit] ?? 3,
      reps: ex.reps,
      unit: ex.unit,
    }));
  }

  // Return formatted exercises for standard splits
  return allSelectedExercises.map(ex => ({
    id: ex.id,
    title: ex.title,
    muscleGroups: ex.muscleGroup,
    baseLoad: ex.loads[userLevel],
    sets: ex.sets?.[userSplit] ?? 3,
    reps: ex.reps,
    unit: ex.unit,
  }));
}

export function getProgressionBlocks(
  baseLoad: number | string,
  durationWeeks: number,
  unit?: string,
  muscleGroup?: string,
): { weeks: string; load: string }[] {
  const blocks = [];

  // Determine if exercise is cardio based on unit or muscle group name
  const isCardio = 
    unit?.trim().includes('минут') || 
    unit?.trim().includes('minutes') ||
    (muscleGroup && muscleGroup.toLowerCase().includes('кардио')) ||
    (muscleGroup && muscleGroup.toLowerCase().includes('cardio'));

  // Get dynamic localization strings
  const weekText = i18n.t('plans.weeksPrefix', { defaultValue: 'Wk.' });
  const kgText = i18n.t('plans.kg', { defaultValue: 'kg' });
  const minText = i18n.t('plans.minutes', { defaultValue: 'min' });
  const cardioTagText = i18n.t('plans.cardioTag', { defaultValue: 'Cardio' });

  // Default unit choice based on active locale and exercise type
  const defaultUnit = isCardio ? minText : (unit && unit.trim() !== '' ? unit : kgText);
  
  for (let week = 1; week <= durationWeeks; week += 2) {
    // Progressive overload: +2.5 per 2-week block for strength exercises
    const progression = isCardio ? 0 : Math.floor((week - 1) / 2) * 2.5;
    
    let finalLoad = '';
    if (isCardio) {
      finalLoad = `⏱ ${typeof baseLoad === 'number' ? baseLoad : baseLoad} ${minText} (${cardioTagText})`;
    } else if (typeof baseLoad === 'string') {
      finalLoad = baseLoad.includes(defaultUnit) ? baseLoad : `${baseLoad} ${defaultUnit}`;
    } else {
      finalLoad = `${baseLoad + progression} ${defaultUnit}`;
    }
    
    blocks.push({
      weeks: `${weekText} ${week}-${week + 1}`,
      load: finalLoad,
    });
  }
  
  return blocks;
}