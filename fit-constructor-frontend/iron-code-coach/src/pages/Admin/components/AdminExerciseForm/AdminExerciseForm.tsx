import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import styles from './AdminExerciseForm.module.scss';
import { MUSCLE_GROUPS } from '../../../../shared/constants';

interface AdminFormProps {
  userEmail: string;
  onExerciseAdded: () => void;
}

export const AdminExerciseForm = ({ userEmail, onExerciseAdded }: AdminFormProps) => {
  const { t, i18n } = useTranslation();
  const [title, setTitle] = useState('');
  const [muscleGroup, setMuscleGroup] = useState('');
  const [description, setDescription] = useState('');
  const [defaultWeight, setDefaultWeight] = useState<number | ''>('');
  const [defaultSets, setDefaultSets] = useState<number | ''>('');
  const [defaultReps, setDefaultReps] = useState('');
  const [video, setVideo] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (
      (typeof defaultWeight === 'number' && defaultWeight < 0) ||
      (typeof defaultSets === 'number' && defaultSets < 0)
    ) {
      alert(t('adminForm.negativeValuesError'));
      return; // Stop form submission
    }

    try {
      const response = await fetch('http://localhost:5000/api/exercises', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'Accept-Language': i18n.language
        },
        body: JSON.stringify({
          email: userEmail, // Pass email to verify admin role on backend
          title,
          muscleGroup,
          description,
          default_weight: Number(defaultWeight) || 0,
          default_sets: Number(defaultSets) || 3,
          default_reps: defaultReps || '8-12',
          video
        })
      });

      const data = await response.json();
      if (!response.ok) throw new Error(data.error);

      alert(data.message);
      // Clear form inputs
      setTitle('');
      setMuscleGroup('');
      setDescription('');
      setDefaultWeight('');
      setDefaultSets('');
      setDefaultReps('');
      setVideo('');
      onExerciseAdded(); // Refresh exercises list
    } catch (err: any) {
      alert(err.message);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      <h3>{t('adminForm.title')}</h3>
      
      <input 
        type="text" 
        placeholder={t('adminForm.titlePlaceholder')}
        value={title} 
        onChange={e => setTitle(e.target.value)} 
        required 
      />
      
      <div className={styles.field}>
        <select 
          className={`${styles.select} ${!muscleGroup ? styles.placeholderActive : ''}`}
          value={muscleGroup} 
          onChange={e => setMuscleGroup(e.target.value)} 
          required 
        >
          <option value="" disabled>{t('adminForm.selectMusclePlaceholder')}</option>
          {MUSCLE_GROUPS.map((group) => {
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
              <option key={group} value={group}>
                {t(translationKey, { defaultValue: group })}
              </option>
            );
          })}
        </select>
      </div>
      
      <textarea 
        placeholder={t('adminForm.descriptionPlaceholder')}
        value={description} 
        onChange={e => setDescription(e.target.value)} 
        className={styles.textarea}
      />
      
      <input 
        type="number" 
        placeholder={t('adminForm.weightPlaceholder')}
        value={defaultWeight} 
        onChange={e => setDefaultWeight(e.target.value === '' ? '' : Number(e.target.value))} 
        required
      />

      <input 
        type="number" 
        placeholder={t('adminForm.setsPlaceholder')}
        value={defaultSets} 
        onChange={e => setDefaultSets(e.target.value === '' ? '' : Number(e.target.value))} 
        required
      />

      <input
        type="text"
        placeholder={t('adminForm.repsPlaceholder')}
        value={defaultReps}
        onChange={e => setDefaultReps(String(e.target.value))}
        required
      />

      <input 
        type="text" 
        placeholder={t('adminForm.videoPlaceholder')}
        value={video} 
        onChange={e => setVideo(e.target.value)}
      />

      <button type="submit">{t('adminForm.submitBtn')}</button>
    </form>
  );
};