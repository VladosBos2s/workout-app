import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { allPlans } from '../../../../Features/plans/data';
import { getExercisesForDay } from '../../../../Features/plans/utils';
import type { ExperienceLevel } from '../../../../shared/types';
import type { Exercise } from '../../../../Features/Exercises/types';
import styles from './AssignPlanEditor.module.scss';
import { API_URL } from '../../../../api';
interface AssignPlanEditorProps {
  adminEmail: string;
  allExercises: Exercise[];
}

interface EditableExercise {
  id: number;
  title: string;
  muscleGroup: string; // Muscle group field preserved for filtering
  sets: number | '';
  reps: string;
  weight: number |string;
}

interface EditableDay {
  dayName: string;
  exercises: EditableExercise[];
}

export const AssignPlanEditor = ({ adminEmail, allExercises }: AssignPlanEditorProps) => {
  const { t, i18n } = useTranslation();
  const [targetEmail, setTargetEmail] = useState('');
  const [selectedPlanIndex, setSelectedPlanIndex] = useState<number>(0);
  const [userLevel, setUserLevel] = useState<ExperienceLevel>('intermediate');
  const [editableDays, setEditableDays] = useState<EditableDay[] | null>(null);

  // Step 1: Generate plan template for editing
  const handleGenerateTemplate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!targetEmail) {
      alert(t('assignPlan.enterEmailAlert'));
      return;
    }

    const plan = allPlans[selectedPlanIndex];
    if (!plan) {
      alert(t('assignPlan.planNotFoundAlert'));
      return;
    }

  const generated: EditableDay[] = plan.days.map((day, dayIndex) => {
      const exercisesForThisDay = getExercisesForDay(
        allExercises,
        plan.split,
        userLevel,
        day.muscleGroups,
        day.exercisesPerGroup,
        dayIndex
      );

      return {
        // Correctly read 'name' from the training plan definition
        dayName: day.name || `Day ${dayIndex + 1}`,
        exercises: exercisesForThisDay.map(ex => {
          const levelKey = (userLevel || 'beginner').toLowerCase() as 'beginner' | 'intermediate' | 'advanced';
          const fullExercise = allExercises.find(item => item.id === ex.id);
          const weightForLevel = fullExercise?.loads ? fullExercise.loads[levelKey] : (ex.baseLoad || 0);

          return {
            id: ex.id,
            title: ex.title,
            muscleGroup: ex.muscleGroups, // Keep muscle group for filtering
            sets: 3,
            reps: '8-12',
            weight: weightForLevel
          };
        })
      };
    });

    setEditableDays(generated);

    setEditableDays(generated);
  };

  // Universal function to modify exercise parameters or replace it via select dropdown
  const handleExerciseChange = (dayIndex: number, exIndex: number, field: keyof EditableExercise | 'exercise', value: any) => {
    if (!editableDays) return;

    const updatedDays = [...editableDays];

    // If trainer changes the exercise itself via select dropdown
    if (field === 'exercise') {
      const selectedExercise = allExercises.find(ex => ex.id === Number(value));
      if (selectedExercise) {
        updatedDays[dayIndex].exercises[exIndex] = {
          ...updatedDays[dayIndex].exercises[exIndex],
          id: selectedExercise.id,
          title: selectedExercise.title,
          muscleGroup: selectedExercise.muscleGroup, // Update muscle group upon change
        };
      }
    } else {
      // For sets, reps, and weight
      let parsedValue = value;
      if (field === 'sets' || field === 'weight') {
        parsedValue = value === '' ? '' : Number(value);
      }

      updatedDays[dayIndex].exercises[exIndex] = {
        ...updatedDays[dayIndex].exercises[exIndex],
        [field]: parsedValue
      };
    }

    setEditableDays(updatedDays);
  };

  // Step 3: Save and submit the customized plan to the backend
  const handleSaveAndAssign = async () => {
    if (!editableDays) return;

    const cleanedDays = editableDays.map(day => ({
      ...day,
      exercises: day.exercises.map(ex => ({
        ...ex,
        sets: ex.sets === '' ? 3 : Number(ex.sets),
        weight: ex.weight === '' ? 0 : Number(ex.weight),
        reps: ex.reps || '8-12'
      }))
    }));

    try {
      const response = await fetch(`${API_URL}/api/admin/set-user-plan`, {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept-Language': i18n.language
        },
        body: JSON.stringify({
          adminEmail,
          targetEmail,
          days: cleanedDays
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert(data.message);
      setEditableDays(null);
      setTargetEmail('');
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <div className={styles.editorContainer}>
      <h3>{t('assignPlan.title')}</h3>

      {/* Configuration form for generation */}
      {!editableDays ? (
        <form onSubmit={handleGenerateTemplate} className={styles.configForm}>
          <input 
            type="email" 
            placeholder={t('assignPlan.emailPlaceholder')}
            value={targetEmail} 
            onChange={e => setTargetEmail(e.target.value)} 
            required 
          />

         <div className={styles.fieldGroup}>
           <label>{t('assignPlan.splitLabel')}</label>
          <select value={selectedPlanIndex} onChange={e => setSelectedPlanIndex(Number(e.target.value))}>
           <option value={0}>{t('assignPlan.splits.fullBody2')}</option>
           <option value={1}>{t('assignPlan.splits.fullBody3')}</option>
           <option value={2}>{t('assignPlan.splits.upperLowerFullBody3')}</option>
           <option value={3}>{t('assignPlan.splits.upperLower4')}</option>
            <option value={4}>{t('assignPlan.splits.upperLower5')}</option>
            <option value={5}>{t('assignPlan.splits.pushPullLegs5')}</option>
            <option value={6}>{t('assignPlan.splits.arnoldSplit5')}</option>
          </select>
        </div>

          <div className={styles.fieldGroup}>
           <label>{t('assignPlan.levelLabel')}</label>
           <select value={userLevel} onChange={e => setUserLevel(e.target.value as ExperienceLevel)}>
             <option value="beginner">{t('assignPlan.levels.beginner')}</option>
              <option value="intermediate">{t('assignPlan.levels.intermediate')}</option>
              <option value="advanced">{t('assignPlan.levels.advanced')}</option>
          </select>
          </div>

          <button type="submit" className={styles.generateBtn}>{t('assignPlan.generateBtn')}</button>
        </form>
      ) : (
        /* Interactive editor for generated days */
        <div className={styles.daysEditor}>
          <h4>{t('assignPlan.editingTitle', { email: targetEmail })}</h4>
          
          {editableDays.map((day, dayIndex) => (
            <div key={dayIndex} className={styles.dayCard}>
              <h5>{day.dayName}</h5>
              
              <div className={styles.exercisesList}>
                {day.exercises.map((ex, exIndex) => (
                  <div key={exIndex} className={styles.exerciseRow}>
                    
                    {/* Exercise dropdown filtered strictly by muscle group */}
                    <div className={styles.selectWrapper}>
                      <select 
                        className={styles.exerciseSelect}
                        value={ex.id} 
                        onChange={e => handleExerciseChange(dayIndex, exIndex, 'exercise', e.target.value)}
                      >
                        {allExercises
                          .filter(exercise => exercise.muscleGroup === ex.muscleGroup)
                          .map(exercise => (
                            <option key={exercise.id} value={exercise.id}>
                              {exercise.title} ({exercise.muscleGroup})
                            </option>
                          ))}
                      </select>
                    </div>
                    
                    <div className={styles.inputsGroup}>
                      {ex.muscleGroup === 'Кардио' ? (
                        // If cardio, display time input only
                        <label>
                          {t('assignPlan.timeLabel')}
                          <input 
                            type="number" 
                            value={ex.weight} 
                            onChange={e => handleExerciseChange(dayIndex, exIndex, 'weight', e.target.value)} 
                          />
                        </label>
                      ) : (
                        // For regular strength exercises
                        <>
                          <label>
                            {t('assignPlan.setsLabel')}
                            <input 
                              type="number" 
                              value={ex.sets} 
                              onChange={e => handleExerciseChange(dayIndex, exIndex, 'sets', e.target.value)} 
                            />
                          </label>
                          
                          <label>
                            {t('assignPlan.repsLabel')}
                            <input 
                              type="text" 
                              value={ex.reps} 
                              onChange={e => handleExerciseChange(dayIndex, exIndex, 'reps', e.target.value)} 
                            />
                          </label>

                          <label>
                            {t('assignPlan.weightLabel')}
                            <input 
                              type="number" 
                              value={ex.weight} 
                              onChange={e => handleExerciseChange(dayIndex, exIndex, 'weight', e.target.value)} 
                            />
                          </label>
                        </>
                      )}
                    </div>

                  </div>
                ))}
              </div>
            </div>
          ))}

          <div className={styles.actions}>
            <button onClick={() => setEditableDays(null)} className={styles.cancelBtn}>{t('assignPlan.cancelBtn')}</button>
            <button onClick={handleSaveAndAssign} className={styles.saveBtn}>{t('assignPlan.saveBtn')}</button>
          </div>
        </div>
      )}
    </div>
  );
};