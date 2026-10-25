import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
// Swiper components and modules
import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination } from 'swiper/modules';
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';
import { API_URL } from '../../api';
// Data types and constants
import { type MuscleGroup, type Exercise } from '../../Features/Exercises/types';
import { ExerciseCard } from '../../Features/Exercises/components/ExerciseCard';
import styles from './ExercisesPage.module.scss';
import type { ExperienceLevel, SplitType } from '../../shared/types';
import { MUSCLE_GROUPS } from '../../shared/constants';

interface ExercisesPageProps {
  userLevel: ExperienceLevel;
  userSplit: SplitType;
}

export const ExercisesPage = ({ userLevel, userSplit }: ExercisesPageProps) => {
  const { t, i18n } = useTranslation();
  
  // Selected muscle group filter (default matches the first key/group)
  const [selected, setSelected] = useState<MuscleGroup>('Грудные');
  
  // States for fetching exercises from the backend
  const [allExercises, setAllExercises] = useState<Exercise[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch exercises on initial component mount
  useEffect(() => {
    const loadExercises = async () => {
      try {
        // You can pass the current language to backend if needed: headers: { 'Accept-Language': i18n.language }
        const response = await fetch(`${API_URL}/api/exercises`, {
          headers: {
            'Accept-Language': i18n.language,
          },
        });
        if (!response.ok) throw new Error('Failed to fetch data');
        
        const data: Exercise[] = await response.json();
        setAllExercises(data);
      } catch (err) {
        console.error(err);
        setError(t('exercises.errorServer') || 'Server connection error');
      } finally {
        setIsLoading(false);
      }
    };

    loadExercises();
  }, [i18n.language]); // Refetch or re-render when language changes if backend supports it

  // Filter exercises based on selected muscle group
  const filtered = allExercises.filter(ex => ex.muscleGroup === selected);

  // Loading and error states
  if (isLoading) return <div className={styles.wrapper}>{t('exercises.loading')}</div>;
  if (error) return <div className={styles.wrapper} style={{ color: 'var(--red-active)' }}>{error}</div>;

  return (
    <div className={styles.wrapper}>
      {/* Muscle groups carousel filter */}
      <Swiper slidesPerView="auto" spaceBetween={8} className={styles.filters}>
        {MUSCLE_GROUPS.map((group) => {
          // Map muscle group constant to i18n key safely
          const muscleKeyMap: Record<string, string> = {
            'Грудные': 'constants.muscles.chest',
            'Спина': 'constants.muscles.back',
            'Ноги': 'constants.muscles.legs',
            'Плечи': 'constants.muscles.shoulders',
            'Бицепс': 'constants.muscles.biceps',
            'Трицепс': 'constants.muscles.triceps',
            'Кардио': 'constants.muscles.cardio',
          };

          const translationKey = muscleKeyMap[group] || group;

          return (
            <SwiperSlide key={group} className={styles.filterSlide}>
              <button
                className={`${styles.filterBtn} ${selected === group ? styles.filterBtnActive : ''}`}
                onClick={() => setSelected(group)}
              >
                {t(translationKey, { defaultValue: group })}
              </button>
            </SwiperSlide>
          );
        })}
      </Swiper>
    
      {/* Exercises cards slider */}
      <Swiper
        modules={[Navigation, Pagination]}
        slidesPerView={1.3}
        centeredSlides={true}
        spaceBetween={20}
        centerInsufficientSlides={true}
        navigation
        pagination={{ clickable: true }}
        breakpoints={{
          640: { slidesPerView: 1.5 },
          1024: { slidesPerView: 2.5 },
        }}
        className={styles.slider}
      >
        {filtered.map((exercise) => (
          <SwiperSlide key={exercise.id}>
            {({ isActive }) => (
              <div style={{
                transform: isActive ? 'scale(1)' : 'scale(0.85)',
                opacity: isActive ? 1 : 0.6,
                transition: 'transform 0.3s, opacity 0.3s',
              }}>
                <ExerciseCard
                  exercise={exercise}
                  userLevel={userLevel}
                  userSplit={userSplit}
                />
              </div>
            )}
          </SwiperSlide>
        ))}
      </Swiper>
    </div>
  );
};