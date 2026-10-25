// Card for a specific exercise
import { useTranslation } from 'react-i18next';
import type { ExperienceLevel, SplitType } from '../../../shared/types';
import type { Exercise } from '../types';
import styles from './ExerciseCard.module.scss';

interface ExerciseCardProps {
    exercise: Exercise;
    userLevel: ExperienceLevel;
    userSplit: SplitType;
}

export const ExerciseCard = ({ exercise, userLevel, userSplit }: ExerciseCardProps) => {
    const { t } = useTranslation();

    // Check if exercise is cardio (checking both Russian database value and unit)
    const isCardio = exercise.muscleGroup === 'Кардио' || exercise.unit === 'минут';

    // Normalize experience level to lowercase to match keys (beginner, intermediate, advanced)
    const levelKey = (userLevel || 'beginner').toLowerCase() as 'beginner' | 'intermediate' | 'advanced';

    // Calculate time or weight: default to 20 minutes if loads value is 0 or undefined
    const cardioTime = exercise.loads?.[levelKey] || 20;
    const strengthWeight = exercise.loads?.[levelKey] ?? 0;

    // Map muscle group to translation key if needed
    const muscleKeyMap: Record<string, string> = {
      'Грудные': 'constants.muscles.chest',
      'Спина': 'constants.muscles.back',
      'Ноги': 'constants.muscles.legs',
      'Плечи': 'constants.muscles.shoulders',
      'Бицепс': 'constants.muscles.biceps',
      'Трицепс': 'constants.muscles.triceps',
      'Кардио': 'constants.muscles.cardio',
    };
    const muscleTranslationKey = muscleKeyMap[exercise.muscleGroup] || exercise.muscleGroup;

    return (
        <div className={styles.container}>
            <h3 className={styles.title}>{exercise.title}</h3>
            <p className={styles.muscleGroup}>{t(muscleTranslationKey, { defaultValue: exercise.muscleGroup })}</p>
            <p className={styles.description}>{exercise.description}</p>
            
            {isCardio ? (
                /* Cardio exercise block */
                <p className={styles.cardioTime}>
                    ⏱ <strong>{t('exerciseCard.timeLabel')}</strong> {cardioTime} {t('exerciseCard.minutes')}
                </p>
            ) : (
                /* Strength exercise block */
                <>
                    <p>
                        <strong>{t('exerciseCard.weightLabel')}</strong> {strengthWeight} {exercise.unit || 'kg'}
                    </p>
                    
                    {exercise.sets && (
                        <p className={styles.sets}>
                            <strong>{t('exerciseCard.setsLabel')}</strong> {exercise.sets?.[userSplit] ?? 3}
                        </p>
                    )}
                    
                    <p className={styles.reps}>
                        <strong>{t('exerciseCard.repsLabel')}</strong> {exercise.reps}
                    </p>
                </>
            )}
            
            {exercise.videoUrl && (
                <button className={styles.videoButton} onClick={() => window.open(exercise.videoUrl, '_blank')}>
                    {t('exerciseCard.watchVideoBtn')}
                </button>
            )}
        </div>
    );
};