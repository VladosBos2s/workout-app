import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useNavigate } from "react-router-dom";
import styles from './ProfilePage.module.scss';
import type { CalculationResult, UserStats } from "../../shared/types";

// Saved workout interface type
interface SavedWorkout {
  id: string;
  dayName: string;
  date: string;
  exercises?: { title: string }[];
}

interface ProfilePageProps {
  userEmail: string;
  stats: UserStats;
  result: CalculationResult | null;
  onLogout: () => void;
}

export const ProfilePage = ({ userEmail, stats, result, onLogout }: ProfilePageProps) => {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const [savedWorkouts, setSavedWorkouts] = useState<SavedWorkout[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  const isAuth = Boolean(userEmail);

  useEffect(() => {
    if (!isAuth) {
      return;
    }
    let isMounted = true;
    
    const loadData = async () => {
      setIsLoading(true);
      try {
        const res = await fetch(`http://localhost:5000/api/saved-workouts?email=${encodeURIComponent(userEmail)}`);
        const data = await res.json();
        if (isMounted) {
          setSavedWorkouts(Array.isArray(data) ? data : []);
        }
      } catch (err) {
        console.error('Error fetching workouts:', err);
      } finally {
        if (isMounted) {
          setIsLoading(false);
        }
      }
    };

    loadData();
    return () => {
      isMounted = false;
    };
  }, [userEmail, isAuth]);

  const displayedWorkouts = isAuth ? savedWorkouts : [];

  const handleDeleteWorkout = async (id: string) => {
    if (!confirm(t('profile.deleteConfirm'))) return;

    try {
      const response = await fetch(`http://localhost:5000/api/saved-workouts/${id}`, { method: 'DELETE' });

      if (!response.ok) throw new Error('Error deleting workout');

      // Update state in frontend upon success
      setSavedWorkouts(prev => prev.filter(workout => workout.id !== id));
    } catch (err) {
      if (err) console.error(err);
      alert(t('profile.deleteError'));
    }
  };

  return (
    <div className={styles.wrapper}>
      {/* Profile Header */}
      <div className={styles.profileHeader}>
        <div>
          <h2 className={styles.title}>{t('profile.title')}</h2>
          <p className={styles.emailText}>{isAuth ? userEmail : t('profile.guest')}</p>
        </div>

        {isAuth ? (
          <button className={styles.logBtn} onClick={onLogout}>
            {t('profile.logoutBtn')}
          </button>
        ) : (
          <button className={styles.logBtn} onClick={() => navigate('/auth')}>
            {t('profile.loginBtn')}
          </button>
        )}
      </div>

      {/* 1. User parameters from useCalculator */}
      <h3 className={styles.sectionTitle}>{t('profile.yourParameters')}</h3>
      <div className={styles.statsContainer}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.weight} {t('profile.kg')}</span>
          <span className={styles.statLabel}>{t('profile.weight')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.height} {t('profile.cm')}</span>
          <span className={styles.statLabel}>{t('profile.height')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.age} {t('profile.years')}</span>
          <span className={styles.statLabel}>{t('profile.age')}</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{stats.trainingsPerWeek} {t('profile.daysPerWeek')}</span>
          <span className={styles.statLabel}>{t('profile.trainings')}</span>
        </div>
      </div>

      {/* 2. Calories & Macros calculation from useCalculator */}
      {result && (
        <>
          <h3 className={styles.sectionTitle}>{t('profile.nutritionTitle')}</h3>
          <div className={styles.statsContainer}>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{result.calories} {t('profile.kcal')}</span>
              <span className={styles.statLabel}>{t('profile.dailyNorm')}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{result.protein} {t('profile.g')}</span>
              <span className={styles.statLabel}>{t('profile.protein')}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{result.fats} {t('profile.g')}</span>
              <span className={styles.statLabel}>{t('profile.fats')}</span>
            </div>
            <div className={styles.statCard}>
              <span className={styles.statValue}>{result.carbs} {t('profile.g')}</span>
              <span className={styles.statLabel}>{t('profile.carbs')}</span>
            </div>
          </div>
        </>
      )}

      {/* 3. Saved Workouts */}
      <h3 className={styles.sectionTitle}>
        {t('profile.savedWorkouts')} ({displayedWorkouts.length})
      </h3>

      {!isAuth ? (
        <p>{t('profile.authPrompt')}</p>
      ) : isLoading ? (
        <p>{t('profile.loading')}</p>
      ) : displayedWorkouts.length === 0 ? (
        <p>{t('profile.emptyList')}</p>
      ) : (
        <div className={styles.historyList}>
          {displayedWorkouts.map((workout) => (
            <div key={workout.id} className={styles.workoutCard}>
              <div className={styles.cardHeader}>
                <div>
                  <h4 className={styles.dayName}>{workout.dayName}</h4>
                  <span className={styles.metaInfo}>
                    {/* Localize date format according to active i18n language */}
                    {new Date(workout.date).toLocaleDateString(i18n.language === 'en' ? 'en-US' : 'ru-RU')}
                  </span>
                </div>
                <button
                  className={styles.deleteBtn}
                  onClick={() => handleDeleteWorkout(workout.id)}
                >
                  {t('profile.delete')}
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};