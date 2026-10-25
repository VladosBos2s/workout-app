import { useTranslation } from 'react-i18next';
import styles from './ResultsDisplay.module.scss';
import type { SplitType } from '../../../../shared/types';

interface ResultsDisplayProps {
  calories: number;
  splits: SplitType[];
  protein: number;
  carbs: number;
  fats: number;
  selectedSplit: SplitType | null;               // Selected split state value
  onSplitSelect: (split: SplitType) => void;     // Callback function to handle split selection
}

export const ResultsDisplay = ({ calories, protein, carbs, fats, splits, selectedSplit, onSplitSelect }: ResultsDisplayProps) => {
  const { t } = useTranslation();

  return (
    <div className={styles.container}>
      <h2 className={styles.title}>{t('calculator.resultsTitle')}</h2>
      <p className={styles.result}>{t('calculator.calories')}: {calories} {t('calculator.kcalDay')}</p>
      <p className={styles.result}>{t('calculator.protein')}: {protein} {t('calculator.gDay')}</p>
      <p className={styles.result}>{t('calculator.carbs')}: {carbs} {t('calculator.gDay')}</p>
      <p className={styles.result}>{t('calculator.fats')}: {fats} {t('calculator.gDay')}</p>
      <p className={styles.results}>{t('calculator.suggestedWorkouts')}</p>
      
      <div className={styles.splitsContainer}>
        {splits.map((split) => {
          // Check if current split in iteration is the one selected by the user
          const isActive = selectedSplit === split;

          return (
            <button
              key={split}
              // Dynamically apply .active CSS class if button is selected
              className={`${styles.splitBtn} ${isActive ? styles.active : ''}`}
              // Update state with selected split on click
              onClick={() => onSplitSelect(split)}
            >
              {/* Format split name by replacing dashes with spaces and converting to uppercase */}
              {split.replace('-', ' ').toUpperCase()}
            </button>
          );
        })}
      </div>
    </div>
  );
};