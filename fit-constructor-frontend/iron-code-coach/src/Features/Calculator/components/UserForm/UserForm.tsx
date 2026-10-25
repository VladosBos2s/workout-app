import { useTranslation } from 'react-i18next';
import { type ActivityLevel, type Gender, type UserStats, type TrainingsperWeek } from '../../../../shared/types';
import styles from './UserForm.module.scss';
import { ACTIVITY_OPTIONS, EXPERIENCE_LEVEL_OPTIONS, GOAL_OPTIONS, TRAINING_FREQUENCY_OPTIONS } from '../../../../shared/constants';

interface UserFormProps {
    stats: UserStats;
    userEmail: string; 
    onChange: (updatedStats: UserStats) => void;
    onSubmit: () => void;
}

export function UserForm({ stats, userEmail, onChange, onSubmit }: UserFormProps) {
    const { t } = useTranslation();

    const handleChange = <Key extends keyof UserStats>(key: Key, value: UserStats[Key]) => {
        onChange({ ...stats, [key]: value });
    };

    const saveParametersToDB = async () => {
      try {
        const response = await fetch('http://localhost:5000/api/user/parameters', {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: userEmail,
            weight: stats.weight,
            height: stats.height,
            age: stats.age,
            activityLevel: stats.activitylevel,
            goal: stats.goal
          })
        });
    
        const data = await response.json();
        if (!response.ok) throw new Error(data.error);
        
        console.log('Parameters saved to database successfully:', data);
      } catch (err: any) {
        console.error('Failed to save parameters:', err.message);
      }
    };

    const handleCalculateClick = async () => {
      if (userEmail) {
        await saveParametersToDB();
      }
      onSubmit();
    };

    return (
    <div className={styles.wrapper}>
      <h2 className={styles.title}>{t('calculator.title')}</h2>
 
      <div className={styles.grid}>
        {/* Gender */}
        <div className={styles.field}>
          <label className={styles.label}>{t('calculator.gender')}</label>
          <div className={styles.toggle}>
            {(['Male', 'Female'] as Gender[]).map((g) => (
              <button
                key={g}
                type="button"
                className={`${styles.toggleBtn} ${stats.gender === g ? styles.toggleBtnActive : ''}`}
                onClick={() => handleChange('gender', g)}
              >
                {g === 'Male' ? t('calculator.male') : t('calculator.female')}
              </button>
            ))}
          </div>
        </div>
 
        {/* Age */}
        <div className={styles.field}>
          <label className={styles.label}>{t('calculator.age')}</label>
          <input
            className={styles.input}
            type="number"
            min={10}
            max={100}
            placeholder={t('calculator.agePlaceholder')}
            value={stats.age === 0 ? '' : stats.age}
            onChange={(e) => handleChange('age', e.target.value === '' ? ('' as any) : Number(e.target.value))}
          />
        </div>
 
        {/* Weight */}
        <div className={styles.field}>
          <label className={styles.label}>{t('calculator.weight')}</label>
          <input
            className={styles.input}
            type="number"
            min={30}
            max={250}
            placeholder={t('calculator.weightPlaceholder')}
            value={stats.weight === 0 ? '' : stats.weight}
            onChange={(e) => handleChange('weight', e.target.value === '' ? ('' as any) : Number(e.target.value))}
          />
        </div>
 
        {/* Height */}
        <div className={styles.field}>
          <label className={styles.label}>{t('calculator.height')}</label>
          <input
            className={styles.input}
            type="number"
            min={100}
            max={250}
            placeholder={t('calculator.heightPlaceholder')}
            value={stats.height === 0 ? '' : stats.height}
            onChange={(e) => handleChange('height', e.target.value === '' ? ('' as any) : Number(e.target.value))}
          />
        </div>
 
        {/* Activity level */}
        <div className={`${styles.field} ${styles.fieldFull}`}>
          <label className={styles.label}>{t('calculator.activityLevel')}</label>
          <select
            className={styles.select}
            value={stats.activitylevel}
            onChange={(e) => handleChange('activitylevel', Number(e.target.value) as ActivityLevel)}
          >
            {ACTIVITY_OPTIONS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {t(opt.labelKey)}
              </option>
            ))}
          </select>
        </div>
 
        {/* Goal */}
        <div className={`${styles.field}`}>
          <label className={styles.label}>{t('calculator.goal')}</label>
          <div className={styles.toggle}>
            {GOAL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.toggleBtn} ${stats.goal === opt.value ? styles.toggleBtnActive : ''}`}
                onClick={() => handleChange('goal', opt.value)}
              >
               {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
 
        {/* Experience level */}
        <div className={styles.field}>
          <label className={styles.label}>{t('calculator.experienceLevel')}</label>
          <div className={styles.toggle}>
            {EXPERIENCE_LEVEL_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                type="button"
                className={`${styles.toggleBtn} ${stats.experienceLevel === opt.value ? styles.toggleBtnActive : ''}`}
                onClick={() => handleChange('experienceLevel', opt.value)}
              >
                {t(opt.labelKey)}
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className={styles.field}>
        <label className={styles.label}>{t('calculator.trainingsPerWeek')}</label>
        <div className={styles.toggle}>
          {TRAINING_FREQUENCY_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              type="button"
              className={`${styles.toggleBtn} ${stats.trainingsPerWeek === opt.value ? styles.toggleBtnActive : ''}`}
              onClick={() => handleChange('trainingsPerWeek', opt.value as TrainingsperWeek)}
            >
           {t(opt.labelKey, { count: opt.value })}
            </button>
          ))}
        </div>
      </div>
 
      <button className={styles.submitBtn} type="button" onClick={handleCalculateClick}>
        {t('calculator.calculateBtn')}
      </button>
    </div>
  );
}