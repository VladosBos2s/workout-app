import { useState, useEffect } from 'react';
import { useTranslation } from 'react-i18next';
import { AdminExerciseForm } from '../components/AdminExerciseForm/AdminExerciseForm';
import { AssignPlanEditor } from '../components/AssignPlanEditor/AssignPlanEditor';
import type { Exercise } from '../../../Features/Exercises/types';
import styles from './AdminPage.module.scss';

interface AdminPageProps {
  adminEmail: string;
}

export const AdminPage = ({ adminEmail }: AdminPageProps) => {
  const { t } = useTranslation();
  const [activeTab, setActiveTab] = useState<'exercises' | 'plans'>('exercises');
  const [allExercises, setAllExercises] = useState<Exercise[]>([]); // State for exercises
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Fetch exercises from backend when opening admin panel
  useEffect(() => {
    const fetchExercises = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/exercises');
        if (!response.ok) throw new Error(t('admin.fetchError'));
        const data = await response.json();
        setAllExercises(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };

    fetchExercises();
  }, [t]);

  return (
    <div className={styles.adminContainer}>
      <h2>{t('admin.title')}</h2>

      <div className={styles.adminTabs}>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'exercises' ? styles.active : ''}`}
          onClick={() => setActiveTab('exercises')}
        >
          ➕ {t('admin.tabExercises')}
        </button>
        <button 
          className={`${styles.tabBtn} ${activeTab === 'plans' ? styles.active : ''}`}
          onClick={() => setActiveTab('plans')}
        >
          📋 {t('admin.tabPlans')}
        </button>
      </div>

      <div className={styles.adminContent}>
        {activeTab === 'exercises' && (
          <AdminExerciseForm userEmail={adminEmail} onExerciseAdded={() => {}} />
        )}

        {activeTab === 'plans' && (
          /* Pass allExercises prop down to the editor */
          isLoading ? (
            <p>{t('admin.loadingExercises')}</p>
          ) : (
            <AssignPlanEditor adminEmail={adminEmail} allExercises={allExercises} />
          )
        )}
      </div>
    </div>
  );
};