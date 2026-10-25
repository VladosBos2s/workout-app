import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { allPlans } from '../../Features/plans/data';
import { getExercisesForDay, getProgressionBlocks } from '../../Features/plans/utils';
import type { SplitType, TrainingsperWeek, ExperienceLevel } from '../../shared/types';
import type { Exercise } from '../../Features/Exercises/types';
import styles from './PlansPage.module.scss';

interface PlansPageProps {
  userEmail: string;
  userSplit: SplitType;
  trainingsPerWeek: TrainingsperWeek;
  userLevel: ExperienceLevel;
}

export const PlansPage = ({ userEmail, userSplit, trainingsPerWeek, userLevel }: PlansPageProps) => {
  const { t, i18n } = useTranslation();
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  
  // State to store custom plan assigned by the trainer
  const [customPlan, setCustomPlan] = useState<any[] | null>(null);

  const [selectedBlock, setSelectedBlock] = useState<number>(() => {
    const savedBlock = localStorage.getItem('user_selected_week_block');
    return savedBlock ? parseInt(savedBlock, 10) : 0;
  });

  // Fetch general exercise database
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/exercises', {
          headers: {
            'Accept-Language': i18n.language, // Pass current language to backend
          },
        });
        if (!response.ok) {
          throw new Error(t('plans.fetchExercisesError'));
        }
        const data: Exercise[] = await response.json();
        setAllExercises(data);
      } catch (err) {
        console.error(err);
        setError(t('plans.serverErrorExercises'));
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [i18n.language, t]);

  // Fetch custom plan assigned by the trainer
  useEffect(() => {
    const fetchCustomPlan = async () => {
      if (!userEmail) return;
      try {
        const response = await fetch(`http://localhost:5000/api/user-full-workouts?email=${userEmail}`, {
          headers: {
            'Accept-Language': i18n.language, // Pass language to backend for translated exercise titles
          },
        });
        if (response.ok) {
          const data = await response.json();
          if (data && data.length > 0) {
            setCustomPlan(data); // Save personal trainer plan
          }
        }
      } catch (err) {
        console.error('Error fetching custom plan:', err);
      }
    };

    fetchCustomPlan();
  }, [userEmail, i18n.language]);

  const handleBlockChange = (index: number) => {
    setSelectedBlock(index);
    localStorage.setItem('user_selected_week_block', index.toString());
  };

  const WEEK_BLOCKS = [
    t('plans.weeksBlock1'), 
    t('plans.weeksBlock2'), 
    t('plans.weeksBlock3'), 
    t('plans.weeksBlock4')
  ];

  if (isLoading) return <div className={styles.wrapper}>{t('plans.loading')}</div>;
  if (error) return <div className={styles.wrapper} style={{ color: 'red' }}>{error}</div>;

  // Find standard plan if needed
  const plan = allPlans.find(p => 
    p.split === userSplit && p.daysPerWeek === trainingsPerWeek
  );

  return (
    <div className={styles.wrapper}>
      {/* Dynamic title depending on plan type */}
      <h2 className={styles.title}>
        {customPlan && customPlan.length > 0 
          ? t('plans.customPlanTitle') 
          : plan 
            ? `${plan.split} — ${plan.daysPerWeek} ${t('plans.daysPerWeekText')}` 
            : t('plans.notFound')
        }
      </h2>
      
      {/* Week progression buttons */}
      <div className={styles.weeksTabs}>
        {WEEK_BLOCKS.map((block, index) => (
          <button
            key={index}
            className={`${styles.weekBtn} ${selectedBlock === index ? styles.active : ''}`}
            onClick={() => handleBlockChange(index)}
          >
            {block}
          </button>
        ))}
      </div>

      {/* Render Custom Plan from Trainer */}
      {customPlan && customPlan.length > 0 ? (
        <div className={styles.daysList}>
          {customPlan.map((day, dayIndex) => (
            <div key={dayIndex} className={styles.day}>
              <div className={styles.dayHeader}>
                <h3 className={styles.dayTitle}>{day.dayName}</h3>
              </div>

              <div className={styles.exercisesList}>
                {day.exercises.map((ex: any, exIndex: number) => {
                  const muscleGroup = ex.muscleGroup || ex.muscleGroups || ex.musclegroup;
                  const isCardio = muscleGroup === 'Кардио' || ex.unit === 'минут';

                  const muscleKeyMap: Record<string, string> = {
                    'Грудные': 'constants.muscles.chest',
                    'Спина': 'constants.muscles.back',
                    'Ноги': 'constants.muscles.legs',
                    'Плечи': 'constants.muscles.shoulders',
                    'Бицепс': 'constants.muscles.biceps',
                    'Трицепс': 'constants.muscles.triceps',
                    'Кардио': 'constants.muscles.cardio',
                  };
                  const muscleTranslationKey = muscleKeyMap[muscleGroup] || muscleGroup;

                  const progression = getProgressionBlocks(Number(ex.weight) || 0, 8, ex.unit, muscleGroup);

                  return (
                    <div key={exIndex} className={styles.exerciseCard}>
                      <div className={styles.exerciseInfo}>
                        <h4>{ex.title}</h4>
                        <p className={styles.muscleGroup}>
                          {t('plans.groupLabel')}: {t(muscleTranslationKey, { defaultValue: muscleGroup || 'General' })}
                        </p>
                      </div>
                      
                      <div className={styles.loadBadge}>
                        <span className={styles.weekLoad}>
                          {isCardio ? (
                            `⏱ ${ex.weight || 20} ${t('plans.minutes')} (${t('plans.cardioTag')})`
                          ) : (
                            progression[selectedBlock]?.load || `${ex.sets} ${t('plans.setsShort')} | ${ex.reps} ${t('plans.repsShort')} | ${ex.weight} ${t('plans.kg')}`
                          )}
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      ) : plan ? (
        /* Render Standard Generated Plan */
        <div className={styles.daysList}>
          {plan.days.map((day, dayIndex) => {
            const exercises = getExercisesForDay(
              allExercises,
              userSplit,
              userLevel,
              day.muscleGroups,
              day.exercisesPerGroup,
              dayIndex
            );

            return (
              <div key={dayIndex} className={styles.day}>
                <div className={styles.dayHeader}>
                  <h3 className={styles.dayTitle}>{day.name}</h3>
                </div>

                <div className={styles.exercisesList}>
                  {exercises.map((ex) => {
                    const progression = getProgressionBlocks(ex.baseLoad, plan.durationWeeks, ex.unit, ex.muscleGroups);
                    const isCardio = ex.muscleGroups === 'Кардио' || ex.unit === 'минут';

                    const muscleKeyMap: Record<string, string> = {
                      'Грудные': 'constants.muscles.chest',
                      'Спина': 'constants.muscles.back',
                      'Ноги': 'constants.muscles.legs',
                      'Плечи': 'constants.muscles.shoulders',
                      'Бицепс': 'constants.muscles.biceps',
                      'Трицепс': 'constants.muscles.triceps',
                      'Кардио': 'constants.muscles.cardio',
                    };
                    const muscleTranslationKey = muscleKeyMap[ex.muscleGroups] || ex.muscleGroups;

                    return (
                      <div key={ex.id} className={styles.exerciseCard}>
                        <div className={styles.exerciseInfo}>
                          <h4>{ex.title}</h4>
                          <p className={styles.muscleGroup}>
                            {t('plans.groupLabel')}: {t(muscleTranslationKey, { defaultValue: ex.muscleGroups })}
                          </p>
                        </div>
                        
                        <div className={styles.loadBadge}>
                          <span className={styles.weekLoad}>
                            {isCardio ? (
                              `⏱ ${ex.baseLoad || 20} ${t('plans.minutes')} (${t('plans.cardioTag')})`
                            ) : (
                              progression[selectedBlock]?.load || `${ex.sets} ${t('plans.setsShort')} | ${ex.reps} ${t('plans.repsShort')} | ${ex.baseLoad} ${t('plans.kg')}`
                            )}
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      ) : (
        <div className={styles.error}>{t('plans.notFound')}</div>
      )}
    </div>
  );
};